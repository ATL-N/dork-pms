import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return user;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.userType = user.userType;
        
        // Fetch farm associations for the user
        const farmUsers = await prisma.farmUser.findMany({
          where: { userId: user.id },
          select: {
            farmId: true,
            role: true,
            farm: {
              select: {
                name: true,
                ownerId: true,
              }
            }
          }
        });

        const ownedFarms = await prisma.farm.findMany({
            where: { ownerId: user.id },
            select: { id: true }
        });

        token.farms = farmUsers.map(fu => ({
          id: fu.farmId,
          name: fu.farm.name,
          role: fu.role,
          isOwner: fu.farm.ownerId === user.id
        }));
        
        token.isOwner = ownedFarms.length > 0 || token.farms.some(f => f.role === 'OWNER');
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.userType = token.userType;
        session.user.farms = token.farms; // Add farms to session
        session.user.isOwner = token.isOwner; // Add owner status to session
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };