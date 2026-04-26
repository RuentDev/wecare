// middleware.ts or proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Example: Check for an auth token in cookies
  const token = request.cookies.get("session_token")?.value;

  // If no token is found, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// The matcher defines which paths this middleware applies to
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
