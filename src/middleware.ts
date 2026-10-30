import { NextRequest, NextResponse } from "next/server";

const VALID_BRANDS = ["biocap", "alliance"];

// Dashboard sections that only a signed-in person may open. The backend is the authority: the access token is checked
// with it before the page is sent. Role rules inside each section and every API still apply as before.
const PROTECTED_PREFIXES = ["/admin", "/officer", "/editor", "/creator", "/dashboard"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://biocapapi.afs-rwanda.org";

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("biocap_token")?.value;
  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return true;
    } catch {
      // API unreachable: fall through and treat as not signed in.
    }
  }
  // An expired access token with a refresh token still present: let the page load so the browser can refresh it.
  // If the refresh fails, the client sends the person to sign-in.
  return Boolean(req.cookies.get("biocap_refresh_token")?.value) && !token;
}

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

export async function middleware(req: NextRequest) {
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

  // 3. Dashboard sections need a signed-in person. The page is not sent to anyone else.
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isProtected && !(await hasValidSession(req))) {
    return NextResponse.redirect(redirectUrl(req, "/auth/login", false));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};