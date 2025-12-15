// auth.js (create this file in your root directory)
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const identifier = credentials.email;
        const isEmail = identifier.includes('@');

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: isEmail ? identifier : undefined },
              { phoneNumber: !isEmail ? identifier : undefined },
            ],
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordsMatch) {
          return null;
        }

        // Return the user object if authentication is successful
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.userType = user.userType;
      }

      // Fetch farm associations whenever JWT is created/updated
      if (token.id) {
        const farmUsers = await prisma.farmUser.findMany({
          where: { userId: token.id },
          select: {
            farmId: true,
            role: true,
            farm: {
              select: {
                name: true,
                ownerId: true,
              },
            },
          },
        });

        const ownedFarms = await prisma.farm.findMany({
          where: { ownerId: token.id },
          select: { id: true },
        });

        token.farms = farmUsers.map((fu) => ({
          id: fu.farmId,
          name: fu.farm.name,
          role: fu.role,
          isOwner: fu.farm.ownerId === token.id,
        }));

        token.isOwner =
          ownedFarms.length > 0 || token.farms.some((f) => f.role === "OWNER");
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.userType = token.userType;
        session.user.farms = token.farms;
        session.user.isOwner = token.isOwner;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
