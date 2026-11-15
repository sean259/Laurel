import { createNeonAuth } from "@neon/auth/next/server";
import { connection } from "next/server";

// Neon Auth (Managed Better Auth): users and sessions live in the `neon_auth` schema,
// and Neon sends the sign-in code emails. Env: NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET.
// Created lazily because on Cloudflare Workers env vars are only available inside a request.
let instance: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  });
  return instance;
}

/** The signed-in user, or null. */
export async function currentUser() {
  // Mark the render as per-request first: neon-auth catches the cookies() bailout itself,
  // which would otherwise let Next prerender pages with a permanently signed-out header.
  await connection();
  const { data } = await getAuth().getSession();
  return data?.user ?? null;
}
