import { z } from "zod";
import { createRouter, publicMutation, authedQuery, authedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { messages } from "@db/schema";
import { eq, count, desc } from "drizzle-orm";

export const messageRouter = createRouter({
  list: authedQuery
    .input(z.object({
      status: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      let query = db.select().from(messages);
      let countQuery = db.select({ count: count() }).from(messages);

      if (input?.status) {
        query = query.where(eq(messages.status, input.status as "new" | "read" | "replied" | "archived")) as typeof query;
        countQuery = countQuery.where(eq(messages.status, input.status as "new" | "read" | "replied" | "archived")) as typeof countQuery;
      }

      const items = await query.orderBy(desc(messages.createdAt)).limit(limit).offset(offset);
      const totalResult = await countQuery;

      return {
        messages: items,
        total: totalResult[0]?.count ?? 0,
      };
    }),

  create: publicMutation
    .input(z.object({
      customerName: z.string(),
      customerPhone: z.string(),
      customerEmail: z.string().optional(),
      subject: z.string().optional(),
      content: z.string(),
      productId: z.number().optional(),
      source: z.enum(["whatsapp", "email", "form"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        subject: input.subject,
        content: input.content,
        productId: input.productId,
        source: input.source || "form",
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  updateStatus: authedMutation
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "read", "replied", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(messages).set({ status: input.status }).where(eq(messages.id, input.id));
      const updated = await db.select().from(messages).where(eq(messages.id, input.id)).limit(1);
      return updated[0];
    }),

  delete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(messages).where(eq(messages.id, input.id));
      return { success: true };
    }),

  stats: authedQuery
    .query(async () => {
      const db = getDb();
      const [total] = await db.select({ count: count() }).from(messages);
      const [newCount] = await db.select({ count: count() }).from(messages).where(eq(messages.status, "new"));
      const [read] = await db.select({ count: count() }).from(messages).where(eq(messages.status, "read"));
      const [replied] = await db.select({ count: count() }).from(messages).where(eq(messages.status, "replied"));

      return {
        total: total?.count ?? 0,
        new: newCount?.count ?? 0,
        read: read?.count ?? 0,
        replied: replied?.count ?? 0,
      };
    }),
});
