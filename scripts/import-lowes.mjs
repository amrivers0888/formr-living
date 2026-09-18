// One-shot: upsert projects by name and insert Lowe's receipt line items.
// Run:  node scripts/import-lowes.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const line of readFileSync(join(__dirname, "..", ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env in .env.local");

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "formr" },
});

const dataFile = process.argv[2] || "lowes-receipts.json";
const data = JSON.parse(readFileSync(join(__dirname, dataFile), "utf8"));
console.log(`Importing from: ${dataFile}\n`);

const existing = await db.from("projects").select("id, name");
if (existing.error) throw existing.error;
const nameToId = new Map(existing.data.map((p) => [p.name.toLowerCase(), p.id]));

for (const p of data.projects) {
  if (nameToId.has(p.name.toLowerCase())) {
    console.log(`  · exists: ${p.name}`);
    continue;
  }
  const ins = await db.from("projects").insert({
    name: p.name,
    room: p.room,
    type: p.type,
    status: "In Progress",
    current_phase: "Materials",
    priority: "Medium",
  }).select("id, name").single();
  if (ins.error) throw ins.error;
  nameToId.set(p.name.toLowerCase(), ins.data.id);
  console.log(`  + created: ${p.name}`);
}

let inserted = 0;
for (const r of data.receipts) {
  const rows = r.items.map((it) => {
    const pid = nameToId.get(it.project.toLowerCase());
    if (!pid) throw new Error(`Unknown project label: ${it.project}`);
    const noteBits = [`Lowe's txn #${r.txn}`, r.store];
    if (it.model) noteBits.push(`model ${it.model}`);
    if (it.note) noteBits.push(it.note);
    return {
      project_id: pid,
      item: it.item,
      category: it.category ?? null,
      description: null,
      qty_needed: it.qty,
      qty_ordered: it.qty,
      qty_received: it.status === "RECEIVED" ? it.qty : 0,
      unit: "each",
      retailer: r.store,
      product_url: null,
      sku: it.sku ?? null,
      est_unit_price: it.price,
      actual_unit_price: it.price,
      order_status: it.status,
      order_date: r.date,
      received_date: it.status === "RECEIVED" ? r.date : null,
      notes: noteBits.join(" · "),
    };
  });
  const res = await db.from("materials").insert(rows);
  if (res.error) throw res.error;
  inserted += rows.length;
  console.log(`  + ${rows.length} items from txn #${r.txn} (${r.date})`);
}

console.log(`\nDone: ${inserted} material rows across ${data.receipts.length} receipts.`);
