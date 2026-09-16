import OpenAI, { toFile } from "openai";
import { getProjectDetail } from "@/lib/data";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_RE = /\.(png|jpe?g|webp|avif)(\?|$)/i;
const COTTAGE =
  "Style: modern English cottage — warm and airy, soft natural daylight, sage green and warm cream tones, natural oak and walnut wood, brass / champagne-bronze hardware, tasteful, cozy, timeless.";

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

  // Gather user-provided reference images (exclude our own AI outputs).
  const refUrls = detail.files
    .filter((f) => f.url && IMAGE_RE.test(f.url) && f.name !== "AI mockup")
    .map((f) => f.url as string)
    .slice(0, 3);

  const openai = new OpenAI({ apiKey });
  const size = "1536x1024"; // wide landscape — matches the hero/card framing
  let b64: string | undefined;

  try {
    if (refUrls.length > 0) {
      // Image-to-image: stay faithful to the real uploaded design.
      const files = await Promise.all(
        refUrls.map(async (u, i) => {
          const res = await fetch(u);
          const buf = Buffer.from(await res.arrayBuffer());
          return toFile(buf, `ref-${i}.png`, { type: "image/png" });
        }),
      );
      const prompt = [
        `Re-render this exact ${p.name.toLowerCase()} as one clean, photorealistic hero image for a design dashboard.`,
        `Stay faithful to the reference image(s): keep the same layout, proportions, door/drawer configuration, and the real materials and colors${p.aesthetic ? ` (${p.aesthetic})` : ""}.`,
        `Do NOT invent a different design. Improve only the lighting and composition into a wide, straight-on landscape shot with a tidy, styled setting.`,
        extra,
        "No text, no watermark, no people.",
      ].filter(Boolean).join(" ");
      const img = await openai.images.edit({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", image: files, prompt, size });
      b64 = img.data?.[0]?.b64_json;
    } else {
      // No reference: generate from the project description in the cottage style.
      const prompt = [
        `A photorealistic interior design mockup of "${p.name}"${p.room ? ` in a ${p.room}` : ""}.`,
        p.what ? `What it is: ${p.what}` : "",
        p.aesthetic ? `Materials & look: ${p.aesthetic}` : "",
        extra,
        COTTAGE,
        "Photorealistic architectural visualization, wide straight-on landscape composition. No text, no watermark, no people.",
      ].filter(Boolean).join(" ");
      const img = await openai.images.generate({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt, size });
      b64 = img.data?.[0]?.b64_json;
    }
  } catch (e: any) {
    return Response.json({ error: `Image generation failed: ${e.message}` }, { status: 200 });
  }
  if (!b64) return Response.json({ error: "No image returned." }, { status: 200 });

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
        return Response.json({ url: pub.publicUrl, saved: true, usedReferences: refUrls.length });
      }
    } catch {
      /* fall through */
    }
  }
  return Response.json({ dataUrl: `data:image/png;base64,${b64}`, saved: false, usedReferences: refUrls.length });
}
