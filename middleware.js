
import { NextResponse } from "next/server";
import * as jose from 'jose';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log("Middleware running for:", pathname);

  // Let authentication API routes pass through
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/veterinarians") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  // API Route Protection
  if (pathname.startsWith('/api')) {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

      try {
        const { payload } = await jose.jwtVerify(token, secret);
        // If token is valid, enrich headers and allow the request
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', payload.id);
        requestHeaders.set('x-user-email', payload.email);
        requestHeaders.set('x-user-type', payload.userType);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (error) {
        // Token is invalid
        return NextResponse.json({ message: 'Authentication required: Invalid token' }, { status: 401 });
      }
    }

    // If no Bearer token, check for a web session cookie
    const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");
    if (sessionToken) {
      return NextResponse.next();
    }

    // If neither a valid Bearer token nor a session cookie is found, reject the request
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  // Web Page Protection (for non-API routes)
  const publicPaths = ["/auth/signin", "/auth/signup", "/veterinarians", '/auth/vet-signup', '/'];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};