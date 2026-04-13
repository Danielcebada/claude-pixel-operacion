import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is disabled for now — Google OAuth needs to be configured first.
// When ready, uncomment the Supabase auth logic below.
export async function proxy(request: NextRequest) {
  // Redirect root to dashboard
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
