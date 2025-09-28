import { getServerSession } from "next-auth/next";
import { authOptions } from "./../api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * A flexible helper to get the current user's session data from either a
 * bearer token (mobile) or a session cookie (web).
 * @param {import("next/server").NextRequest} [req] - The request object.
 */
export async function getCurrentUser(req) {
  // 1. Check for mobile user via token (validated by middleware)
  if (req && req.headers.has('x-user-id')) {
    const userId = req.headers.get('x-user-id');
    console.log("=== TOKEN AUTH DEBUG ===");
    console.log("Found user ID from token:", userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        farms: {
          select: {
            farmId: true,
            role: true,
          }
        }
      }
    });

    if (user) {
        const userFarms = user.farms.map(f => ({ id: f.farmId, role: f.role }));
        const finalUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            image: user.image,
            ownerApprovalStatus: user.ownerApprovalStatus,
            createdAt: user.createdAt.toISOString(), // Ensure dates are sent as ISO strings
            updatedAt: user.updatedAt.toISOString(),
            farms: userFarms,
            isOwner: userFarms.some(f => f.role === 'OWNER'),
        };
        console.log("Returning user from token:", finalUser);
        console.log("=== END TOKEN AUTH DEBUG ===");
        return finalUser;
    }
  }

  // 2. Fallback to web session cookie
  const session = await getServerSession(authOptions);

  console.log("=== SESSION DEBUG ===");
  console.log("Full session:", JSON.stringify(session, null, 2));
  console.log("Session user:", session?.user);
  console.log("User ID:", session?.user?.id);
  console.log("User role:", session?.user?.role);
  console.log("=== END SESSION DEBUG ===");

  return session?.user;
}
