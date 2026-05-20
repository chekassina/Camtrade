import { z } from "zod";
import { createRouter, publicMutation, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { adminUsers, products, orders, messages } from "@db/schema";
import { eq, count, sql, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.APP_SECRET || "fallback-secret");

async function createToken(userId: number) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export const adminRouter = createRouter({
  login: publicMutation
    .input(z.object({
      username: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.select().from(adminUsers)
        .where(eq(adminUsers.username, input.username))
        .limit(1);

      if (!user[0]) {
        return { success: false, error: "Invalid credentials" };
      }

      const valid = await bcrypt.compare(input.password, user[0].passwordHash);
      if (!valid) {
        return { success: false, error: "Invalid credentials" };
      }

      const token = await createToken(user[0].id);

      await db.update(adminUsers)
        .set({ lastLogin: new Date() })
        .where(eq(adminUsers.id, user[0].id));

      return {
        success: true,
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          displayName: user[0].displayName,
          role: user[0].role,
        },
      };
    }),

  me: authedQuery
    .query(async ({ ctx }) => {
      const db = getDb();
      const user = await db.select().from(adminUsers)
        .where(eq(adminUsers.id, ctx.admin!.id))
        .limit(1);

      if (!user[0]) return null;

      return {
        id: user[0].id,
        username: user[0].username,
        displayName: user[0].displayName,
        role: user[0].role,
        email: user[0].email,
      };
    }),

  dashboardStats: authedQuery
    .query(async () => {
      const db = getDb();

      const [productCount] = await db.select({ count: count() }).from(products);
      const [orderCount] = await db.select({ count: count() }).from(orders);
      const [pendingOrders] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
      const [messageCount] = await db.select({ count: count() }).from(messages).where(eq(messages.status, "new"));

      const revenueResult = await db.select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      }).from(orders).where(eq(orders.status, "completed"));

      const [lowStock] = await db.select({ count: count() }).from(products)
        .where(and(
          sql`${products.stockQuantity} <= ${products.lowStockThreshold}`,
          sql`${products.stockQuantity} > 0`
        ));

      return {
        productCount: productCount?.count ?? 0,
        orderCount: orderCount?.count ?? 0,
        pendingOrders: pendingOrders?.count ?? 0,
        messageCount: messageCount?.count ?? 0,
        revenue: revenueResult[0]?.total ?? 0,
        lowStockCount: lowStock?.count ?? 0,
      };
    }),
});
