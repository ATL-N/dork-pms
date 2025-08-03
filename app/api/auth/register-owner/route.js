
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        userType: 'FARMER', // All owners are technically farmers
        ownerApprovalStatus: 'PENDING',
      },
    });

    // Add user to General Chat
    try {
      const generalChat = await prisma.conversation.findUnique({
        where: { name: 'General Chat' },
      });
      if (generalChat) {
        await prisma.conversationParticipant.create({
          data: {
            conversationId: generalChat.id,
            userId: newUser.id,
          },
        });
      }
    } catch (chatError) {
      console.error("Failed to add user to General Chat:", chatError);
      // Non-critical error, so we don't block the registration
    }

    // In a real application, you would also trigger an email to the admin here.

    return new Response(JSON.stringify({ message: 'Application submitted successfully' }), { status: 201 });

  } catch (error) {
    console.error("Owner registration error:", error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
