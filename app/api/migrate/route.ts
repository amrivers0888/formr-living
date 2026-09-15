import { getServerClient } from "@/lib/supabase";
import { SAMPLE_DETAILS } from "@/lib/sampleData";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One-time seed of the database from the bundled project data. Guarded by ?key=. */
export async function POST(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key !== (process.env.MIGRATE_KEY || "formr-seed")) {
    return Response.json({ error: "bad key" }, { status: 401 });
  }
  const db = getServerClient();
  if (!db) return Response.json({ error: "no database" }, { status: 400 });

  const existing = await db.from("projects").select("id");
  if ((existing.data?.length ?? 0) > 0 && !new URL(request.url).searchParams.get("force")) {
    return Response.json({ skipped: true, reason: "projects already exist; pass &force=1 to add anyway" });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const mapUrl = (u: string | null): string | null => {
    if (!u) return u;
    if (u.startsWith("/mockups/")) return `${base}/storage/v1/object/public/mockups/${u.split("/").pop()}`;
    return u;
  };
  const strip = <T extends { id?: string; project_id?: string }>(rows: T[], pid: string) =>
    rows.map(({ id, project_id, ...rest }) => ({ ...rest, project_id: pid }));

  const summary: Record<string, number> = { projects: 0, materials: 0, measurements: 0, decisions: 0, build_steps: 0, cut_list: 0, files: 0 };

  for (const d of SAMPLE_DETAILS) {
    const pid = randomUUID();
    const { id, created_at, ...proj } = d.project as any;
    const projRow = { ...proj, id: pid, cover_image: mapUrl(d.project.cover_image) };
    const pr = await db.from("projects").insert(projRow);
    if (pr.error) return Response.json({ error: `projects: ${pr.error.message}`, summary }, { status: 500 });
    summary.projects++;

    const inserts: [string, any[]][] = [
      ["materials", strip(d.materials, pid)],
      ["measurements", strip(d.measurements, pid)],
      ["decisions", strip(d.decisions, pid)],
      ["build_steps", strip(d.steps, pid)],
      ["cut_list", strip(d.cuts, pid)],
      ["files", strip(d.files.map((f) => ({ ...f, url: mapUrl(f.url) })), pid)],
    ];
    for (const [table, rows] of inserts) {
      if (!rows.length) continue;
      const res = await db.from(table).insert(rows);
      if (res.error) return Response.json({ error: `${table}: ${res.error.message}`, summary }, { status: 500 });
      summary[table] += rows.length;
    }
  }

  return Response.json({ ok: true, summary });
}
