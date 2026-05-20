import { z } from "zod";
import { createRouter, publicQuery, authedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { categories } from "@db/schema";
import { eq, like } from "drizzle-orm";

export const categoryRouter = createRouter({
  list: publicQuery
    .input(z.object({ search: z.string().optional(), isActive: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();

      if (input?.isActive !== undefined) {
        return db.select().from(categories).where(eq(categories.isActive, input.isActive)).orderBy(categories.sortOrder);
      }
      if (input?.search) {
        return db.select().from(categories).where(like(categories.name, `%${input.search}%`)).orderBy(categories.sortOrder);
      }

      return db.select().from(categories).orderBy(categories.sortOrder);
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const category = await db.select().from(categories).where(eq(categories.slug, input.slug)).limit(1);
      return category[0] || null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const category = await db.select().from(categories).where(eq(categories.id, input.id)).limit(1);
      return category[0] || null;
    }),

  create: authedMutation
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      icon: z.string().min(1),
      description: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(categories).values({
        name: input.name,
        slug: input.slug,
        icon: input.icon,
        description: input.description,
        sortOrder: input.sortOrder ?? 0,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  update: authedMutation
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(categories).set(data).where(eq(categories.id, id));
      const updated = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      return updated[0];
    }),

  delete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
