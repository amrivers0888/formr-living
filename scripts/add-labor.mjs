// One-shot: add labor expense rows for drywall / framing / plumbing (split 3 ways).
// Reads env from .env.local. Idempotent-ish: refuses to insert a labor row that
// already matches (project_id, item, actual_unit_price).

import { readFileSync } from "node:fs";
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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: env.SUPABASE_SCHEMA || "formr" },
});

const today = new Date().toISOString().slice(0, 10);

async function findOrCreateProject(name, room) {
  const { data: existing, error: findErr } = await sb
    .from("projects").select("id, name").eq("name", name).limit(1);
  if (findErr) throw findErr;
  if (existing && existing.length) return existing[0];
  const { data: created, error: createErr } = await sb
    .from("projects")
    .insert({
      name,
      room,
      type: "Plumbing",
      status: "In Progress",
      current_phase: "Build",
    })
    .select("id, name")
    .single();
  if (createErr) throw createErr;
  console.log(`  + created project "${name}" (${created.id})`);
  return created;
}

async function addLabor(project, item, amount, notes) {
  const { data: dupes, error: dupErr } = await sb
    .from("materials")
    .select("id, item, actual_unit_price")
    .eq("project_id", project.id)
    .eq("item", item)
    .eq("actual_unit_price", amount);
  if (dupErr) throw dupErr;
  if (dupes && dupes.length) {
    console.log(`  = skipped (exists): ${project.name} / ${item} / $${amount}`);
    return;
  }
  const { error: insErr } = await sb.from("materials").insert({
    project_id: project.id,
    item,
    category: "Labor",
    description: notes || null,
    qty_needed: 1,
    qty_ordered: 1,
    unit: "job",
    actual_unit_price: amount,
    order_status: "RECEIVED",
    order_date: today,
    notes: notes || null,
  });
  if (insErr) throw insErr;
  console.log(`  + ${project.name} / ${item} / $${amount}`);
}

const drywall  = await findOrCreateProject("Basement Drywall",   "Basement");
const framing  = await findOrCreateProject("Basement Framing",   "Basement");
const bath     = await findOrCreateProject("Basement Bathroom",  "Basement");
const minibar  = await findOrCreateProject("Basement Mini Bar",  "Basement");
const litter   = await findOrCreateProject("Smart Litter Box",   "House");

console.log("\nInserting labor rows:");
await addLabor(drywall, "Drywall labor",  3500, "Freelancer (name TBD)");
await addLabor(framing, "Framing labor",  1000, "Freelancer (name TBD)");
await addLabor(bath,    "Plumbing labor — basement bathroom rough-in", 800,
  "Plumbing company (name TBD). Part of $1,400 crew job covering bathroom + mini bar + litter box.");
await addLabor(minibar, "Plumbing labor — mini bar rough-in", 400,
  "Plumbing company (name TBD). Part of $1,400 crew job covering bathroom + mini bar + litter box.");
await addLabor(litter,  "Plumbing labor — drain + water line", 200,
  "Plumbing company (name TBD). Part of $1,400 crew job covering bathroom + mini bar + litter box.");

console.log("\nDone.");
