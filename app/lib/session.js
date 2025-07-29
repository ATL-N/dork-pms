// lib/session.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./../api/auth/[...nextauth]/route";

/**
 * A flexible helper to get the current user's session.
 * Can be used in both API Routes and React Server Components.
 * @param {import("next/server").NextRequest} [req] - The request object (for API Routes).
 * @param {import("next/server").NextResponse} [res] - The response object (for API Routes).
 */
export async function getCurrentUser(req, res) {
  let session;

  if (req && res) {
    // For API Routes: pass req, res, and authOptions
    session = await getServerSession(req, res, authOptions);
  } else {
    // For React Server Components: just pass authOptions
    session = await getServerSession(authOptions);
  }

  console.log("=== SESSION DEBUG ===");
  console.log("Full session:", JSON.stringify(session, null, 2));
  console.log("Session user:", session?.user);
  console.log("User ID:", session?.user?.id);
  console.log("User role:", session?.user?.role);
  console.log("=== END SESSION DEBUG ===");

  return session?.user;
}