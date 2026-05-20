import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

async function seed() {
  try {
    console.log("Seeding database...");

    // Create MySQL/MariaDB connection
    const conn = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "",
      database: "khassy_marketplace",
      port: 3306,
      connectTimeout: 15000,
    });

    console.log("Database connected successfully");

    // ===============================
    // CREATE SETTINGS TABLE
    // ===============================

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_name VARCHAR(255),
        whatsapp_number VARCHAR(50),
        currency VARCHAR(20),
        usd_rate DECIMAL(10,2),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Settings table ready");

    // ===============================
    // CLEAR EXISTING DATA
    // ===============================

    await conn.execute("DELETE FROM products");
    await conn.execute("DELETE FROM categories");
    await conn.execute("DELETE FROM admin_users");
    await conn.execute("DELETE FROM orders");
    await conn.execute("DELETE FROM messages");
    await conn.execute("DELETE FROM settings");

    console.log("Cleared existing data");

    // ===============================
    // INSERT SETTINGS
    // ===============================

    await conn.query(
      `
      INSERT INTO settings (
        store_name,
        whatsapp_number,
        currency,
        usd_rate
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        "CamerTrade",
        "+237 650123456",
        "FCFA",
        600,
      ]
    );

    console.log("Inserted settings");

    // ===============================
    // SEED CATEGORIES
    // ===============================

    const cats = [
      ["Electronics", "electronics", "Monitor", "TVs, audio systems, cameras & more"],
      ["Laptops", "laptops", "Laptop", "Notebooks, MacBooks & accessories"],
      ["Printers", "printers", "Printer", "Inkjet, laser & 3D printers"],
      ["Fashion Men", "fashion-men", "Shirt", "Men's clothing & accessories"],
      ["Baby Products", "baby-products", "Baby", "Strollers, diapers & baby care"],
      ["Phones", "phones", "Smartphone", "Smartphones & accessories"],
      ["Beauty Products", "beauty-products", "Sparkles", "Skincare, cosmetics & fragrances"],
      ["Books", "books", "BookOpen", "Textbooks, novels & educational materials"],
      ["Motorcycles", "motorcycles", "Bike", "Motorcycles, scooters & parts"],
      ["Furniture", "furniture", "Sofa", "Living room, bedroom & office furniture"],
      ["Building Materials", "building-materials", "HardHat", "Tiles, cement, roofing & more"],
      ["Home Appliances", "home-appliances", "Refrigerator", "Fridges, ACs, washing machines & more"],
    ];

    for (const [name, slug, icon, description] of cats) {
      await conn.query(
        `
        INSERT INTO categories
        (name, slug, icon, description, product_count)
        VALUES (?, ?, ?, ?, 0)
        `,
        [name, slug, icon, description]
      );
    }

    console.log("Inserted 12 categories");

    // ===============================
    // SEED PRODUCTS
    // ===============================

    const prods = [
      [
        "Premium Ceramic Floor Tiles (60x60cm)",
        "premium-ceramic-floor-tiles-60x60",
        "High-quality ceramic floor tiles with a beautiful beige marble pattern.",
        "Beige marble pattern ceramic tiles, 60x60cm",
        11,
        15000,
        "25.00",
        18000,
        "TILE-CER-6060-01",
        "ItalCeramica",
        "Ceramic",
        "60 x 60 cm",
        "18 kg/box",
        "Italy",
        500,
        "4.8",
        124,
        "/uploads/products/tiles-ceramic.jpg",
        true,
      ],
      [
        "MacBook Pro M3 14-inch Laptop",
        "macbook-pro-m3-14-inch",
        "Apple MacBook Pro with M3 chip and 14-inch display.",
        "M3 chip, 14-inch, 18GB RAM, 512GB SSD",
        2,
        850000,
        "1416.67",
        950000,
        "LAP-APL-M3-14",
        "Apple",
        "Aluminum",
        "31.26 x 22.12 x 1.55 cm",
        "1.61 kg",
        "USA",
        15,
        "4.9",
        89,
        "/uploads/products/macbook-pro.jpg",
        true,
      ],
      [
        "Samsung Galaxy S24 Ultra 256GB",
        "samsung-galaxy-s24-ultra-256gb",
        "Samsung flagship smartphone with S Pen.",
        "256GB, 200MP camera, S Pen, Titanium",
        6,
        650000,
        "1083.33",
        null,
        "PHN-SAM-S24U-256",
        "Samsung",
        "Titanium",
        "162.3 x 79.0 x 8.6 mm",
        "233g",
        "South Korea",
        30,
        "4.8",
        156,
        "/uploads/products/samsung-s24.jpg",
        true,
      ],
    ];

    for (const p of prods) {
      await conn.query(
        `
        INSERT INTO products (
          name,
          slug,
          description,
          short_description,
          category_id,
          price_fcfa,
          price_usd,
          compare_price,
          sku,
          brand,
          material,
          dimensions,
          weight,
          origin,
          stock_quantity,
          rating,
          review_count,
          featured_image,
          is_featured,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `,
        p
      );
    }

    console.log("Inserted products");

    // ===============================
    // UPDATE CATEGORY COUNTS
    // ===============================

    await conn.execute(
      "UPDATE categories SET product_count = 3 WHERE id = 11"
    );

    await conn.execute(
      "UPDATE categories SET product_count = 1 WHERE id IN (2,6)"
    );

    console.log("Updated category counts");

    // ===============================
    // CREATE ADMIN USER
    // ===============================

    const passwordHash = await bcrypt.hash("khassy", 10);

    await conn.query(
      `
      INSERT INTO admin_users (
        username,
        password_hash,
        display_name,
        email,
        role,
        is_active
      )
      VALUES (?, ?, ?, ?, 'super_admin', true)
      `,
      [
        "khassy",
        passwordHash,
        "Admin",
        "admin@camertrade.cm",
      ]
    );

    console.log("Inserted admin user");
    console.log("Username: khassy");
    console.log("Password: khassy");

    // ===============================
    // CLOSE CONNECTION
    // ===============================

    await conn.end();

    console.log("Seed completed successfully!");

  } catch (error) {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run seeder
seed();