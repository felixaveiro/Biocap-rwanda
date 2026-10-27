import { NextRequest, NextResponse } from "next/server";

const VALID_BRANDS = ["biocap", "alliance"];

// BioCap public website routes (AFS has its own website)
const PUBLIC_PREFIXES = [
  "/About",
  "/Biotech",
  "/Stewardship-News",
  "/Gallery",
  "/Resource",
  "/Milestones",
  "/Objectives",
];

// Build a redirect URL that uses the real public host (works behind Docker/proxy)
function redirectUrl(req: NextRequest, pathname: string, keepSearch: boolean) {
  const url = req.nextUrl.clone();

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim();

  if (forwardedHost) {
    url.host = forwardedHost;
    // Only clear the internal port when the public host has no port of its own
    if (!forwardedHost.includes(":")) url.port = "";
  }
  if (forwardedProto) {
    url.protocol = forwardedProto;
  }

  url.pathname = pathname;
  if (!keepSearch) url.search = "";
  return url;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const fromUrl = req.nextUrl.searchParams.get("brand");

  // 1. ?brand=alliance -> save cookie, then reload the same page without ?brand
  if (fromUrl && VALID_BRANDS.includes(fromUrl)) {
    const url = redirectUrl(req, pathname, true);
    url.searchParams.delete("brand");

    const res = NextResponse.redirect(url);
    res.cookies.set("brand", fromUrl, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: url.protocol === "https:",
    });
    return res;
  }

  // The app root is the BioCap website, even if this browser last used AFS.
  if (pathname === "/" && req.cookies.get("brand")?.value === "alliance") {
    const url = redirectUrl(req, "/", true);
    const res = NextResponse.redirect(url);
    res.cookies.set("brand", "biocap", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: url.protocol === "https:",
    });
    return res;
  }

  // 2. AFS users never see the BioCap public pages
  if (req.cookies.get("brand")?.value === "alliance") {
    const isPublic =
      PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (isPublic) {
      return NextResponse.redirect(redirectUrl(req, "/auth/login", false));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};