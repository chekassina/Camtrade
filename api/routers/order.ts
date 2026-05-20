import { z } from "zod";
import { createRouter, publicMutation, authedQuery, authedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { orders } from "@db/schema";
import { eq, count, desc, like, sql } from "drizzle-orm";

export const orderRouter = createRouter({
  list: authedQuery
    .input(z.object({
      status: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      let query = db.select().from(orders);
      let countQuery = db.select({ count: count() }).from(orders);

      if (input?.status) {
        query = query.where(eq(orders.status, input.status as "pending" | "processing" | "completed" | "cancelled")) as typeof query;
        countQuery = countQuery.where(eq(orders.status, input.status as "pending" | "processing" | "completed" | "cancelled")) as typeof countQuery;
      }

      if (input?.search) {
        const searchCondition = like(orders.customerName, `%${input.search}%`);
        query = query.where(searchCondition) as typeof query;
        countQuery = countQuery.where(searchCondition) as typeof countQuery;
      }

      const items = await query.orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
      const totalResult = await countQuery;

      return {
        orders: items,
        total: totalResult[0]?.count ?? 0,
      };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      return order[0] || null;
    }),

  create: publicMutation
    .input(z.object({
      customerName: z.string(),
      customerPhone: z.string(),
      customerEmail: z.string().optional(),
      customerAddress: z.string().optional(),
      city: z.string().optional(),
      products: z.array(z.object({
        productId: z.number(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string().optional(),
      })),
      totalAmount: z.number(),
      paymentMethod: z.enum(["whatsapp", "mobile_money", "bank_transfer", "cash"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const orderNumber = `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`;

      const result = await db.insert(orders).values({
        orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        customerAddress: input.customerAddress,
        city: input.city,
        products: JSON.stringify(input.products),
        totalAmount: input.totalAmount,
        paymentMethod: input.paymentMethod || "whatsapp",
        notes: input.notes,
      });

      return { id: Number(result[0].insertId), orderNumber };
    }),

  updateStatus: authedMutation
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "completed", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
      const updated = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      return updated[0];
    }),

  delete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(orders).where(eq(orders.id, input.id));
      return { success: true };
    }),

  stats: authedQuery
    .query(async () => {
      const db = getDb();
      const [total] = await db.select({ count: count() }).from(orders);
      const [pending] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
      const [processing] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "processing"));
      const [completed] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "completed"));
      const [cancelled] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "cancelled"));
      const revenue = await db.select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      }).from(orders).where(eq(orders.status, "completed"));

      return {
        total: total?.count ?? 0,
        pending: pending?.count ?? 0,
        processing: processing?.count ?? 0,
        completed: completed?.count ?? 0,
        cancelled: cancelled?.count ?? 0,
        revenue: revenue[0]?.total ?? 0,
      };
    }),
});
