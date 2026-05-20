import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  bigint,
  json,
  int,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

// ======================================================
// CATEGORIES
// ======================================================

export const categories = mysqlTable("categories", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  name: varchar("name", { length: 100 })
    .notNull()
    .unique(),

  slug: varchar("slug", { length: 100 })
    .notNull()
    .unique(),

  icon: varchar("icon", { length: 50 }).notNull(),

  description: text("description"),

  productCount: int("product_count").default(0),

  sortOrder: int("sort_order").default(0),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// ======================================================
// PRODUCTS
// ======================================================

export const products = mysqlTable("products", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  slug: varchar("slug", { length: 255 })
    .notNull()
    .unique(),

  description: text("description"),

  shortDescription: varchar("short_description", {
    length: 500,
  }),

  categoryId: bigint("category_id", {
    mode: "number",
    unsigned: true,
  }),

  priceFcfa: bigint("price_fcfa", {
    mode: "number",
  }).notNull(),

  priceUsd: decimal("price_usd", {
    precision: 10,
    scale: 2,
  }).notNull(),

  comparePrice: bigint("compare_price", {
    mode: "number",
  }),

  costPrice: bigint("cost_price", {
    mode: "number",
  }),

  sku: varchar("sku", { length: 100 }),

  brand: varchar("brand", { length: 100 }),

  material: varchar("material", { length: 100 }),

  dimensions: varchar("dimensions", {
    length: 100,
  }),

  weight: varchar("weight", { length: 50 }),

  origin: varchar("origin", { length: 100 }),

  stockQuantity: int("stock_quantity").default(0),

  lowStockThreshold: int("low_stock_threshold").default(5),

  rating: decimal("rating", {
    precision: 2,
    scale: 1,
  }).default("5.0"),

  reviewCount: int("review_count").default(0),

  images: json("images"),

  featuredImage: varchar("featured_image", {
    length: 500,
  }),

  isFeatured: boolean("is_featured").default(false),

  isActive: boolean("is_active").default(true),

  status: mysqlEnum("status", [
    "active",
    "draft",
    "archived",
  ]).default("active"),

  metaTitle: varchar("meta_title", {
    length: 255,
  }),

  metaDescription: varchar("meta_description", {
    length: 500,
  }),

  whatsappNumber: varchar("whatsapp_number", {
    length: 20,
  }).default("+237XXXXXXXXX"),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// ======================================================
// ORDERS
// ======================================================

export const orders = mysqlTable("orders", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  orderNumber: varchar("order_number", {
    length: 50,
  })
    .notNull()
    .unique(),

  customerName: varchar("customer_name", {
    length: 255,
  }).notNull(),

  customerPhone: varchar("customer_phone", {
    length: 20,
  }).notNull(),

  customerEmail: varchar("customer_email", {
    length: 255,
  }),

  customerAddress: text("customer_address"),

  city: varchar("city", { length: 100 }),

  products: json("products").notNull(),

  totalAmount: bigint("total_amount", {
    mode: "number",
  }).notNull(),

  status: mysqlEnum("status", [
    "pending",
    "processing",
    "completed",
    "cancelled",
  ]).default("pending"),

  paymentMethod: mysqlEnum("payment_method", [
    "whatsapp",
    "mobile_money",
    "bank_transfer",
    "cash",
  ]).default("whatsapp"),

  notes: text("notes"),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// ======================================================
// MESSAGES
// ======================================================

export const messages = mysqlTable("messages", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  customerName: varchar("customer_name", {
    length: 255,
  }).notNull(),

  customerPhone: varchar("customer_phone", {
    length: 20,
  }).notNull(),

  customerEmail: varchar("customer_email", {
    length: 255,
  }),

  subject: varchar("subject", {
    length: 255,
  }),

  content: text("content").notNull(),

  productId: bigint("product_id", {
    mode: "number",
    unsigned: true,
  }),

  status: mysqlEnum("status", [
    "new",
    "read",
    "replied",
    "archived",
  ]).default("new"),

  source: mysqlEnum("source", [
    "whatsapp",
    "email",
    "form",
  ]).default("form"),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// ======================================================
// ADMIN USERS
// ======================================================

export const adminUsers = mysqlTable("admin_users", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  username: varchar("username", {
    length: 50,
  })
    .notNull()
    .unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  displayName: varchar("display_name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }),

  role: mysqlEnum("role", [
    "super_admin",
    "admin",
    "editor",
  ]).default("admin"),

  isActive: boolean("is_active").default(true),

  lastLogin: timestamp("last_login"),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

// ======================================================
// SETTINGS
// ======================================================

export const settings = mysqlTable("settings", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),

  storeName: varchar("store_name", {
    length: 255,
  }).notNull(),

  whatsappNumber: varchar("whatsapp_number", {
    length: 20,
  }).notNull(),

  currency: varchar("currency", {
    length: 20,
  }).default("FCFA"),

  usdRate: decimal("usd_rate", {
    precision: 10,
    scale: 2,
  }).default("600.00"),

  siteLogo: varchar("site_logo", {
    length: 500,
  }),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});