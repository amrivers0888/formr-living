import "server-only";
import { getServerClient } from "./supabase";

/**
 * Write helpers used by the AI assistant's tools. Each returns a short
 * human-readable result string. They throw if Supabase isn't connected.
 */

function db() {
  const client = getServerClient();
  if (!client) throw new Error("The database isn't connected yet, so I can't save this. Add your Supabase keys first.");
  return client;
}

export async function createProject(fields: Record<string, unknown>): Promise<{ id: string; name: string }> {
  const row = {
    name: fields.name,
    room: fields.room ?? null,
    type: fields.type ?? null,
    status: fields.status ?? "Planning / Brainstorming",
    priority: fields.priority ?? "Medium",
    current_phase: fields.current_phase ?? "Concept",
    next_action: fields.next_action ?? null,
    estimated_budget: fields.estimated_budget ?? null,
    what: fields.what ?? null,
    why: fields.why ?? null,
    design_goal: fields.design_goal ?? null,
    aesthetic: fields.aesthetic ?? null,
    constraints: fields.constraints ?? null,
    notes: fields.notes ?? null,
    cover_image: fields.cover_image ?? null,
  };
  const { data, error } = await db().from("projects").insert(row).select("id, name").single();
  if (error) throw new Error(error.message);
  return data as { id: string; name: string };
}

export async function updateProject(id: string, fields: Record<string, unknown>): Promise<string> {
  const { error } = await db().from("projects").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  return `Updated project.`;
}

async function insertMany(table: string, project_id: string, rows: Record<string, unknown>[]): Promise<string> {
  if (!rows?.length) return `No ${table} rows to add.`;
  const withProject = rows.map((r) => ({ ...r, project_id }));
  const { error } = await db().from(table).insert(withProject);
  if (error) throw new Error(error.message);
  return `Added ${rows.length} ${table.replace("_", " ")} item(s).`;
}

export const addMaterials = (pid: string, rows: Record<string, unknown>[]) => insertMany("materials", pid, rows);
export const addMeasurements = (pid: string, rows: Record<string, unknown>[]) => insertMany("measurements", pid, rows);
export const addDecisions = (pid: string, rows: Record<string, unknown>[]) => insertMany("decisions", pid, rows);
export const addBuildSteps = (pid: string, rows: Record<string, unknown>[]) => insertMany("build_steps", pid, rows);
export const addCutParts = (pid: string, rows: Record<string, unknown>[]) => insertMany("cut_list", pid, rows);
