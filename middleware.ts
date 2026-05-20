import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow root — it redirects internally
  if (pathname === "/") return NextResponse.next();

  // Check for auth token in the persisted zustand store (localStorage → cookie fallback)
  // Next.js middleware runs on the edge, so we read from cookies, not localStorage.
  // The frontend sets a "rf-auth-token" cookie on login for this purpose.
  const token = request.cookies.get("rf-auth-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - API routes (handled by backend)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
