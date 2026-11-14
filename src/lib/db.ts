import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// On Cloudflare Workers a database connection can't be shared between requests,
// so we create a client per request. `cache` dedupes it within one server render.
// In API routes, call getDb() once at the top of the handler.
export const getDb = cache(() => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
});
