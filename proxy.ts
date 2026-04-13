import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session_id";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname.startsWith("/employee") || pathname.startsWith("/admin")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employee/:path*", "/admin/:path*"],
};
