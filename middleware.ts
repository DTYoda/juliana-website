import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page itself to load
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    const expected = process.env.ADMIN_PASSWORD_HASH;

    // If cookie matches the configured hash, allow
    if (cookie && expected && cookie === expected) {
      return NextResponse.next();
    }

    // Otherwise, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

