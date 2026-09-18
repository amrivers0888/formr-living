import { NextResponse } from "next/server";
import { updateProject } from "@/lib/mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = new Set([
  "name",
  "room",
  "type",
  "status",
  "priority",
  "current_phase",
  "next_action",
  "estimated_budget",
  "percent_complete",
  "what",
  "why",
  "design_goal",
  "aesthetic",
  "constraints",
  "notes",
]);

export async function PATCH(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body ?? {})) {
    if (ALLOWED_FIELDS.has(k)) fields[k] = v;
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No editable fields provided." }, { status: 400 });
  }

  try {
    await updateProject(id, fields);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
