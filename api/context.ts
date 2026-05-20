import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { jwtVerify } from "jose";
import { getDb } from "./queries/connection";
import { adminUsers } from "@db/schema";
import { eq } from "drizzle-orm";

const secret = new TextEncoder().encode(process.env.APP_SECRET || "fallback-secret");

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  admin: { id: number; username: string; displayName: string; role: string } | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  let admin = null;

  const token = opts.req.headers.get("x-admin-token");
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
      if (payload.sub) {
        const db = getDb();
        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.id, Number(payload.sub)),
        });
        if (user && user.isActive) {
          admin = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role ?? "admin",
          };
        }
      }
    } catch {
      // Invalid token, admin stays null
    }
  }

  return { req: opts.req, resHeaders: opts.resHeaders, admin };
}
