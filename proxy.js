import { NextResponse } from "next/server";
import * as jose from "jose";
import { auth } from "@/auth";

// Helper function to verify session token
async function verifySessionToken(token) {
  if (!token) return null;

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Session token verification failed:", error);
    return null;
  }
}

// Helper function to get session token from cookies
function getSessionToken(req) {
  return (
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

// Helper function to verify Bearer token
async function verifyBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Bearer token verification failed:", error);
    return null;
  }
}

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only log in development
  if (process.env.NODE_ENV === "development") {
    console.log("Middleware running for:", pathname);
  }

  // Define public paths that don't require authentication
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/vet-signup",
    "/veterinarians",
    "/market",
    "/",
  ];

  // Define API routes that should bypass auth
  const publicApiPaths = [
    "/api/auth",
    "/api/upload",
    "/api/auth/register-owner-mobile",
    "/api/health",
    "/api/tasks/templates/sync",
    "/api/notifications/trigger",
    "/api/farms/nearby",
    // "/api/users",
  ];

  // Special handling for veterinarians route: GET is public, other methods are protected
  if (pathname.startsWith("/api/veterinarians")) {
    if (req.method === "GET") {
      return NextResponse.next();
    }
  }

  // Check if this is a public API path
  const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

  if (isPublicApi) {
    return NextResponse.next();
  }

  // ============================================
  // API ROUTE PROTECTION
  // ============================================
  if (pathname.startsWith("/api")) {
    const authHeader = req.headers.get("authorization");

    // 1. Try Bearer token authentication (for mobile app)
    if (authHeader) {
      const payload = await verifyBearerToken(authHeader);

      if (payload) {
        // Valid Bearer token - enrich headers
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", String(payload.id || payload.sub));
        requestHeaders.set("x-user-email", payload.email || "");
        requestHeaders.set("x-user-type", payload.userType || "");

        return NextResponse.next({ request: { headers: requestHeaders } });
      } else {
        // Invalid Bearer token
        return NextResponse.json(
          { message: "Authentication required: Invalid token" },
          { status: 401 }
        );
      }
    }

    // 2. Try web session authentication (req.auth is populated by the `auth()` wrapper)
    if (req.auth && req.auth.user) {
      const user = req.auth.user;

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", user.id || "");
      requestHeaders.set("x-user-email", user.email || "");
      requestHeaders.set("x-user-type", user.userType || "");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // 3. No valid authentication found
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  // ============================================
  // WEB PAGE PROTECTION
  // ============================================

  // Check if this is a public page
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected page - check if user is authenticated via NextAuth session
  // The `req.auth` is provided by wrapping with auth()
  if (!req.auth) {
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // Valid session - allow access
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
