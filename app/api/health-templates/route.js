// app/api/health-templates/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/session";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/health-templates:
 *   get:
 *     summary: Fetches all health schedule templates
 *     description: Retrieves a list of all generic health schedule templates used for generating health tasks for new flocks.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: A list of health schedule templates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HealthScheduleTemplate'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
export async function GET(request) {
  const user = await getCurrentUser(request);

  if (!user) {
    // Although templates are generic, we protect the endpoint from public access.
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const templates = await prisma.healthScheduleTemplate.findMany({
      orderBy: [
        { birdType: 'asc' },
        { day: 'asc' },
      ],
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch health schedule templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch health schedule templates" },
      { status: 500 }
    );
  }
}
