import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADMIN_PATH = "/alutta-ops";

function normalizePath(path: string | undefined) {
  if (!path) return DEFAULT_ADMIN_PATH;

  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return DEFAULT_ADMIN_PATH;

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function proxy(req: NextRequest) {
  const adminPath = normalizePath(process.env.ADMIN_PATH);
  const { pathname } = req.nextUrl;

  if (pathname === adminPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.rewrite(url);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/((?!api|_next|favicon.ico).*)"],
};
