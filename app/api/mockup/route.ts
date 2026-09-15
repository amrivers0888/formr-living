import OpenAI from "openai";
import { getProjectDetail } from "@/lib/data";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STYLE =
  "Style: modern English cottage — warm and airy, soft natural daylight, sage green and warm cream tones, natural oak and walnut wood, brass / champagne-bronze hardware, tasteful, cozy, timeless. Photorealistic interior architectural visualization. No text, no watermark, no people.";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Add OPENAI_API_KEY to generate mockups." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const projectId: string | undefined = body.projectId;
  const extra: string = typeof body.prompt === "string" ? body.prompt : "";
  if (!projectId) return Response.json({ error: "Missing projectId." }, { status: 400 });

  const detail = await getProjectDetail(projectId);
  if (!detail) return Response.json({ error: "Project not found." }, { status: 404 });
  const p = detail.project;

  const prompt = [
    `A photorealistic interior design mockup of "${p.name}"${p.room ? ` in a ${p.room}` : ""}.`,
    p.what ? `What it is: ${p.what}` : "",
    p.aesthetic ? `Materials & look: ${p.aesthetic}` : "",
    extra,
    STYLE,
  ].filter(Boolean).join(" ");

  const openai = new OpenAI({ apiKey });
  let b64: string | undefined;
  try {
    const img = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt,
      size: "1536x1024",
    });
    b64 = img.data?.[0]?.b64_json;
  } catch (e: any) {
    return Response.json({ error: `Image generation failed: ${e.message}` }, { status: 200 });
  }
  if (!b64) return Response.json({ error: "No image returned." }, { status: 200 });

  // If the database is connected, store the image and save it as the cover.
  const db = getServerClient();
  if (db) {
    try {
      const buffer = Buffer.from(b64, "base64");
      const path = `${projectId}-${Date.now()}.png`;
      const up = await db.storage.from("mockups").upload(path, buffer, { contentType: "image/png", upsert: true });
      if (!up.error) {
        const { data: pub } = db.storage.from("mockups").getPublicUrl(path);
        await db.from("projects").update({ cover_image: pub.publicUrl }).eq("id", projectId);
        await db.from("files").insert({ project_id: projectId, name: "AI mockup", type: "Rendering", url: pub.publicUrl });
        return Response.json({ url: pub.publicUrl, saved: true });
      }
    } catch {
      /* fall through to ephemeral preview */
    }
  }

  return Response.json({ dataUrl: `data:image/png;base64,${b64}`, saved: false });
}
