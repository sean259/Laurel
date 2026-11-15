import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db";

// Sign in with Google. Sessions live in a signed cookie (JWT), so no session table is needed;
// we only keep a User row so tournaments can point at their owner.
// Env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true, // Cloudflare Workers sits behind a proxy
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      // Only runs with `profile` on the sign-in request itself.
      if (profile?.email) {
        const user = await getDb().user.upsert({
          where: { email: profile.email },
          update: { name: profile.name ?? undefined },
          create: { email: profile.email, name: profile.name ?? null },
        });
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});
