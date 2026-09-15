import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple password gate. If APP_PASSWORD is unset (e.g. local dev), the app is
 * open. Otherwise every page requires the `reno_auth` cookie to match.
 * This is a lightweight personal gate, not full auth — upgrade to Supabase Auth later.
 */
export function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("reno_auth")?.value;
  if (token === password) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)"],
};
