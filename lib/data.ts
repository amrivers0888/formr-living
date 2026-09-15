import "server-only";
import { getServerClient, hasSupabase } from "./supabase";
import { SAMPLE_PROJECTS, SAMPLE_DETAILS, sampleDetail } from "./sampleData";
import { actualSpend, estMaterialCost } from "./types";
import type { Project, ProjectDetail, Material } from "./types";

export interface ProjectWithTotals extends Project {
  spent: number;
  est_material_cost: number;
}

/** Projects plus derived spend/estimate totals, for the dashboard. */
export async function getProjectsWithTotals(): Promise<ProjectWithTotals[]> {
  const db = getServerClient();
  if (!db) {
    return SAMPLE_DETAILS.map((d) => ({
      ...d.project,
      spent: actualSpend(d.materials),
      est_material_cost: estMaterialCost(d.materials),
    }));
  }
  const [projectsRes, materialsRes] = await Promise.all([
    db.from("projects").select("*").order("created_at", { ascending: true }),
    db.from("materials").select("*"),
  ]);
  if (projectsRes.error) throw new Error(projectsRes.error.message);
  const materials = (materialsRes.data ?? []) as Material[];
  const byProject = new Map<string, Material[]>();
  for (const m of materials) {
    const arr = byProject.get(m.project_id) ?? [];
    arr.push(m);
    byProject.set(m.project_id, arr);
  }
  return (projectsRes.data ?? []).map((p) => {
    const mats = byProject.get((p as Project).id) ?? [];
    return { ...(p as Project), spent: actualSpend(mats), est_material_cost: estMaterialCost(mats) };
  });
}

/**
 * Data access layer. Uses Supabase when configured, otherwise falls back to
 * bundled sample data so the app renders end-to-end before the DB is connected.
 */

export async function getProjects(): Promise<Project[]> {
  const db = getServerClient();
  if (!db) return SAMPLE_PROJECTS;
  const { data, error } = await db.from("projects").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data ?? []) as Project[];
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const db = getServerClient();
  if (!db) return sampleDetail(id) ?? null;

  const { data: project, error } = await db.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to load project: ${error.message}`);
  if (!project) return null;

  const [materials, measurements, decisions, steps, cuts, files] = await Promise.all([
    db.from("materials").select("*").eq("project_id", id),
    db.from("measurements").select("*").eq("project_id", id),
    db.from("decisions").select("*").eq("project_id", id),
    db.from("build_steps").select("*").eq("project_id", id).order("step_no", { ascending: true }),
    db.from("cut_list").select("*").eq("project_id", id),
    db.from("files").select("*").eq("project_id", id),
  ]);

  return {
    project: project as Project,
    materials: (materials.data ?? []) as ProjectDetail["materials"],
    measurements: (measurements.data ?? []) as ProjectDetail["measurements"],
    decisions: (decisions.data ?? []) as ProjectDetail["decisions"],
    steps: (steps.data ?? []) as ProjectDetail["steps"],
    cuts: (cuts.data ?? []) as ProjectDetail["cuts"],
    files: (files.data ?? []) as ProjectDetail["files"],
  };
}

export { hasSupabase };
