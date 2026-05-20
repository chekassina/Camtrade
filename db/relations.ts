import { relations } from "drizzle-orm";

import {
  categories,
  products,
  messages,
  settings,
  adminUsers,
  orders,
} from "./schema";

// ======================================================
// CATEGORIES RELATIONS
// ======================================================

export const categoriesRelations = relations(
  categories,
  ({ many }) => ({
    products: many(products),
  })
);

// ======================================================
// PRODUCTS RELATIONS
// ======================================================

export const productsRelations = relations(
  products,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [products.categoryId],
      references: [categories.id],
    }),

    messages: many(messages),
  })
);

// ======================================================
// MESSAGES RELATIONS
// ======================================================

export const messagesRelations = relations(
  messages,
  ({ one }) => ({
    product: one(products, {
      fields: [messages.productId],
      references: [products.id],
    }),
  })
);

// ======================================================
// SETTINGS RELATIONS
// ======================================================

export const settingsRelations = relations(
  settings,
  () => ({})
);

// ======================================================
// ADMIN USERS RELATIONS
// ======================================================

export const adminUsersRelations = relations(
  adminUsers,
  () => ({})
);

// ======================================================
// ORDERS RELATIONS
// ======================================================

export const ordersRelations = relations(
  orders,
  () => ({})
);