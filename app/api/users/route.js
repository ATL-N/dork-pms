// app/api/users/route.js
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/session";

export async function GET(request) {
  try {
    // console.log("=== API Route Debug ===");
    // console.log("Request received");

    const user = await getCurrentUser(request);
    // console.log("Current user:", user);

    if (!user) {
      // console.log("No user found - returning 401");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // console.log("Fetching users from database...");
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: user.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        userType: true,
        farms: {
          select: {
            farmId: true,
          },
        },
        vetProfile: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // console.log("Users fetched:", users.length);

    // Get the current user's farm IDs
    const currentUserFarms = await prisma.farmUser.findMany({
      where: { userId: user.id },
      select: { farmId: true },
    });
    const currentUserFarmIds = new Set(currentUserFarms.map((fu) => fu.farmId));

    // Add isSameFarm flag and flatten vetProfile to each user
    const usersWithFarmInfo = users.map((u) => {
      const hasCommonFarm = u.farms.some((fu) =>
        currentUserFarmIds.has(fu.farmId)
      );
      const { vetProfile, ...userWithoutProfile } = u;
      return {
        ...userWithoutProfile,
        ...vetProfile,
        isSameFarm: hasCommonFarm,
      };
    });

    // console.log("Returning users with farm info");
    return NextResponse.json(usersWithFarmInfo);
  } catch (error) {
    // console.error("=== ERROR in /api/users ===");
    // console.error("Error type:", error.constructor.name);
    // console.error("Error message:", error.message);
    // console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
