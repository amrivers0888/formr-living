// Full migration: bills-dashboard/formr → formr-living/public
import { readFileSync } from "node:fs";
import { resolve6 as dnsResolve6 } from "node:dns/promises";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const newRef = env.NEW_SUPABASE_URL.replace("https://", "").split(".")[0];
const dbPassword = env.NEW_DB_PASSWORD;

// --- Connect via Supavisor transaction pooler (IPv4-compatible) ---
const client = new pg.Client({
  host: "aws-1-us-west-2.pooler.supabase.com",
  port: 6543,
  user: `postgres.${newRef}`,
  password: dbPassword,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
await client.connect();
console.log("[pg] connected via us-west-2 pooler");

const schemaSql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
console.log("[schema] applying schema.sql...");
await client.query(schemaSql);
console.log("[schema] applied.");
await client.query("notify pgrst, 'reload schema'");
await client.end();
await new Promise((r) => setTimeout(r, 4000));

// --- Copy table rows ---
const oldDb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "formr" },
});
const newDb = createClient(env.NEW_SUPABASE_URL, env.NEW_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

const TABLES = ["projects", "materials", "measurements", "decisions", "build_steps", "cut_list", "files"];
console.log("\n[data] copying tables:");
for (const t of TABLES) {
  const { data, error } = await oldDb.from(t).select("*");
  if (error) throw new Error(`[${t}] read: ${error.message}`);
  if (!data || data.length === 0) { console.log(`  ${t.padEnd(14)} 0 rows`); continue; }
  for (let i = 0; i < data.length; i += 500) {
    const chunk = data.slice(i, i + 500);
    const { error: upErr } = await newDb.from(t).upsert(chunk, { onConflict: "id" });
    if (upErr) throw new Error(`[${t}] upsert: ${upErr.message}`);
  }
  console.log(`  ${t.padEnd(14)} ${data.length} rows copied`);
}

// --- Storage: copy mockups bucket ---
console.log("\n[storage] copying mockups bucket...");
try {
  const { data: destBuckets } = await newDb.storage.listBuckets();
  if (!destBuckets.find((b) => b.name === "mockups")) {
    await newDb.storage.createBucket("mockups", { public: true });
    console.log("  created 'mockups' bucket on new project (public)");
  }
  async function walk(prefix = "") {
    const { data: entries, error } = await oldDb.storage.from("mockups").list(prefix, { limit: 1000 });
    if (error) throw new Error(`list ${prefix}: ${error.message}`);
    const files = [];
    for (const e of entries || []) {
      const path = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) files.push(...(await walk(path)));
      else files.push(path);
    }
    return files;
  }
  const paths = await walk("");
  console.log(`  found ${paths.length} objects`);
  let copied = 0;
  for (const p of paths) {
    const { data: blob, error: dlErr } = await oldDb.storage.from("mockups").download(p);
    if (dlErr) { console.log(`  SKIP ${p}: ${dlErr.message}`); continue; }
    const buf = Buffer.from(await blob.arrayBuffer());
    const { error: upErr } = await newDb.storage.from("mockups").upload(p, buf, {
      upsert: true,
      contentType: blob.type || "application/octet-stream",
    });
    if (upErr) { console.log(`  FAIL ${p}: ${upErr.message}`); continue; }
    copied++;
  }
  console.log(`  copied ${copied}/${paths.length} objects`);
} catch (e) {
  console.log(`  storage copy error (non-fatal): ${e.message}`);
}

// --- Verify ---
console.log("\n[verify] new project row counts:");
for (const t of TABLES) {
  const { count, error } = await newDb.from(t).select("*", { count: "exact", head: true });
  console.log(`  ${t.padEnd(14)} ${error ? "ERR " + error.message : count + " rows"}`);
}
console.log("\nDone.");
