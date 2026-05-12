import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://taxzy-backend.fly.dev";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    const target = new URL(pathname + req.nextUrl.search, BACKEND_URL);
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
