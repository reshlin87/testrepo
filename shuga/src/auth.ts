import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

/** Demo sign-in for local previews only. Never enabled in production. */
export const demoLoginEnabled =
  process.env.AUTH_DEMO_LOGIN === "true" && process.env.NODE_ENV !== "production";

const providers: Provider[] = [Google, Facebook];

if (demoLoginEnabled) {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: {},
      async authorize() {
        const user = await prisma.user.upsert({
          where: { email: "demo@shuga.local" },
          update: {},
          create: { email: "demo@shuga.local", name: "Thandi Demo" },
        });
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT sessions keep each request light; users and linked accounts still live in the database.
  session: { strategy: "jwt" },
  providers,
  pages: { signIn: "/login", error: "/login" },
  trustHost: true,
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** Returns the signed-in user's id, or null. */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
