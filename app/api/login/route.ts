export const runtime = "nodejs";

export async function POST(request: Request) {
  const password = process.env.APP_PASSWORD;
  const body = await request.json().catch(() => ({}));
  const attempt = typeof body.password === "string" ? body.password : "";

  if (!password || attempt !== password) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `reno_auth=${encodeURIComponent(password)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
  );
  return res;
}
