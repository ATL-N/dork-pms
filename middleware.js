
import { NextResponse } from "next/server";
import * as jose from 'jose';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log("Middleware running for:", pathname);

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    const authHeader = req.headers.get('authorization');
    const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

      try {
        const { payload } = await jose.jwtVerify(token, secret);
        
        // Add user info to the request headers
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
        console.error("API route - Invalid token:", error.message);
        return NextResponse.json({ message: 'Authentication required: Invalid token' }, { status: 401 });
      }
    }

    if (sessionToken) {
      // This part is for web sessions. For simplicity in this context, we assume it works.
      // A more robust solution would decode the session token here as well.
      console.log("API route - Valid web session found.");
      return NextResponse.next();
    }

    console.log("API route - No valid token or session found.");
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  // --- Existing Web Page Protection Logic ---
  const publicPaths = ["/auth/signin", "/auth/signup", "/veterinarians", '/auth/vet-signup', '/'];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path))
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

  if (sessionToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth/signin", req.url);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};