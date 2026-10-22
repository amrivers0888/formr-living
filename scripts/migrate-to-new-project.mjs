// Migration: bills-dashboard/formr schema  →  formr-living project/public schema.
// Reads both old + new creds from .env.local.
// Idempotent: safe to re-run; existing rows (matched by id) are skipped.

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

const oldDb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "formr" },
});
const newDb = createClient(env.NEW_SUPABASE_URL, env.NEW_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

// Order matters: parent tables before children (FK dependency).
const TABLES = ["projects", "materials", "measurements", "decisions", "build_steps", "cut_list", "files"];

async function copyTable(name) {
  const { data, error } = await oldDb.from(name).select("*");
  if (error) throw new Error(`[${name}] read: ${error.message}`);
  if (!data || data.length === 0) {
    console.log(`  ${name}: 0 rows (nothing to copy)`);
    return;
  }
  // Chunked upsert on id to be idempotent.
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { error: upErr } = await newDb.from(name).upsert(chunk, { onConflict: "id", ignoreDuplicates: false });
    if (upErr) throw new Error(`[${name}] upsert chunk ${i}: ${upErr.message}`);
    inserted += chunk.length;
  }
  console.log(`  ${name}: ${inserted} rows copied`);
}

console.log("Migrating tables:");
for (const t of TABLES) await copyTable(t);
console.log("\nTable migration done.");
