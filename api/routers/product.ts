import { z } from "zod";
import { createRouter, publicQuery, authedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { products, categories } from "@db/schema";
import { eq, like, and, gte, lte, desc, count } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      categoryId: z.number().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      minRating: z.number().optional(),
      sortBy: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      featured: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.search) {
        conditions.push(like(products.name, `%${input.search}%`));
      }
      if (input?.categoryId) {
        conditions.push(eq(products.categoryId, input.categoryId));
      }
      if (input?.minPrice !== undefined) {
        conditions.push(gte(products.priceFcfa, input.minPrice));
      }
      if (input?.maxPrice !== undefined) {
        conditions.push(lte(products.priceFcfa, input.maxPrice));
      }
      if (input?.minRating !== undefined) {
        conditions.push(gte(products.rating, String(input.minRating)));
      }
      if (input?.featured !== undefined) {
        conditions.push(eq(products.isFeatured, input.featured));
      }
      conditions.push(eq(products.isActive, true));
      conditions.push(eq(products.status, "active"));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db.select({ count: count() }).from(products).where(whereClause);
      const total = totalResult[0]?.count ?? 0;

      // Get products
      let query = db.select().from(products).where(whereClause);

      if (input?.sortBy === "price_asc") {
        query = query.orderBy(products.priceFcfa) as typeof query;
      } else if (input?.sortBy === "price_desc") {
        query = query.orderBy(desc(products.priceFcfa)) as typeof query;
      } else if (input?.sortBy === "rating") {
        query = query.orderBy(desc(products.rating)) as typeof query;
      } else {
        query = query.orderBy(desc(products.createdAt)) as typeof query;
      }

      const items = await query.limit(limit).offset(offset);

      return {
        products: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
      if (!product[0]) return null;

      const category = product[0].categoryId
        ? await db.select().from(categories).where(eq(categories.id, product[0].categoryId)).limit(1)
        : null;

      return { ...product[0], category: category?.[0] || null };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      return product[0] || null;
    }),

  featured: publicQuery
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 10;
      return db.select().from(products)
        .where(and(eq(products.isFeatured, true), eq(products.isActive, true), eq(products.status, "active")))
        .orderBy(desc(products.createdAt))
        .limit(limit);
    }),

  create: authedMutation
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      categoryId: z.number().optional(),
      priceFcfa: z.number(),
      priceUsd: z.string(),
      comparePrice: z.number().optional(),
      costPrice: z.number().optional(),
      sku: z.string().optional(),
      brand: z.string().optional(),
      material: z.string().optional(),
      dimensions: z.string().optional(),
      weight: z.string().optional(),
      origin: z.string().optional(),
      stockQuantity: z.number().optional(),
      lowStockThreshold: z.number().optional(),
      images: z.array(z.string()).optional(),
      featuredImage: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      status: z.enum(["active", "draft", "archived"]).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        status: input.status || "active",
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  update: authedMutation
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      categoryId: z.number().optional(),
      priceFcfa: z.number().optional(),
      priceUsd: z.string().optional(),
      comparePrice: z.number().optional(),
      costPrice: z.number().optional(),
      sku: z.string().optional(),
      brand: z.string().optional(),
      material: z.string().optional(),
      dimensions: z.string().optional(),
      weight: z.string().optional(),
      origin: z.string().optional(),
      stockQuantity: z.number().optional(),
      lowStockThreshold: z.number().optional(),
      images: z.array(z.string()).optional(),
      featuredImage: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      status: z.enum(["active", "draft", "archived"]).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return updated[0];
    }),

  delete: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  toggleFeatured: authedMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const product = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!product[0]) throw new Error("Product not found");
      const newValue = !product[0].isFeatured;
      await db.update(products).set({ isFeatured: newValue }).where(eq(products.id, input.id));
      return { ...product[0], isFeatured: newValue };
    }),
});
