import { getAuth } from "@/lib/auth/server";

type Ctx = { params: Promise<{ path: string[] }> };

// Proxy every /api/auth/* request to Neon Auth (built per request: env is only ready then).
export const GET = (req: Request, ctx: Ctx) => getAuth().handler().GET(req, ctx);
export const POST = (req: Request, ctx: Ctx) => getAuth().handler().POST(req, ctx);
