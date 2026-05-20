import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("Seeding database...");
  
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL!,
    connectTimeout: 15000,
  });

  // Clear existing data
  await conn.execute("DELETE FROM products");
  await conn.execute("DELETE FROM categories");
  await conn.execute("DELETE FROM admin_users");
  await conn.execute("DELETE FROM orders");
  await conn.execute("DELETE FROM messages");
  console.log("Cleared existing data");

  // Seed categories
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
      "INSERT INTO categories (name, slug, icon, description, product_count) VALUES (?, ?, ?, ?, 0)",
      [name, slug, icon, description]
    );
  }
  console.log("Inserted 12 categories");

  // Seed products
  const prods = [
    ["Premium Ceramic Floor Tiles (60x60cm)", "premium-ceramic-floor-tiles-60x60",
     "High-quality ceramic floor tiles with a beautiful beige marble pattern. Perfect for residential and commercial spaces. Size: 60x60cm. Material: Premium ceramic. Origin: Italy. Water absorption: <0.5%.",
     "Beige marble pattern ceramic tiles, 60x60cm", 11, 15000, "25.00", 18000, "TILE-CER-6060-01",
     "ItalCeramica", "Ceramic", "60 x 60 cm", "18 kg/box", "Italy", 500, "4.8", 124,
     "/uploads/products/tiles-ceramic.jpg", true],
    ["MacBook Pro M3 14-inch Laptop", "macbook-pro-m3-14-inch",
     "Apple MacBook Pro with M3 chip, 14-inch Liquid Retina XDR display, 18GB unified memory, 512GB SSD storage. Perfect for professionals and creatives.",
     "M3 chip, 14-inch, 18GB RAM, 512GB SSD", 2, 850000, "1416.67", 950000, "LAP-APL-M3-14",
     "Apple", "Aluminum", "31.26 x 22.12 x 1.55 cm", "1.61 kg", "USA", 15, "4.9", 89,
     "/uploads/products/macbook-pro.jpg", true],
    ["Italian Marble Floor Tiles (80x80cm)", "italian-marble-floor-tiles-80x80",
     "Luxurious Italian Calacatta marble floor tiles with dramatic grey veining on white surface. Size: 80x80cm. Polished finish. Perfect for luxury homes and hotels.",
     "Calacatta marble tiles, 80x80cm, polished", 11, 28000, "46.67", 35000, "TILE-MAR-8080-01",
     "Carrara Premium", "Natural Marble", "80 x 80 cm", "32 kg/box", "Italy", 200, "4.7", 67,
     "/uploads/products/marble-tiles.jpg", true],
    ["Samsung Galaxy S24 Ultra 256GB", "samsung-galaxy-s24-ultra-256gb",
     "Samsung Galaxy S24 Ultra with 6.8-inch AMOLED display, Snapdragon 8 Gen 3, 256GB storage, 200MP camera, S Pen included. Titanium frame.",
     "256GB, 200MP camera, S Pen, Titanium", 6, 650000, "1083.33", null, "PHN-SAM-S24U-256",
     "Samsung", "Titanium", "162.3 x 79.0 x 8.6 mm", "233g", "South Korea", 30, "4.8", 156,
     "/uploads/products/samsung-s24.jpg", true],
    ["HP LaserJet Pro Wireless Printer", "hp-laserjet-pro-wireless",
     "HP LaserJet Pro M404n wireless monochrome printer. Fast printing up to 40ppm, automatic duplex, Wi-Fi connectivity, mobile printing support.",
     "40ppm, wireless, duplex printing", 3, 120000, "200.00", 145000, "PRT-HP-LJ-404",
     "HP", "Plastic/Metal", "38.1 x 35.7 x 25.4 cm", "8.5 kg", "China", 25, "4.5", 43,
     "/uploads/products/hp-printer.jpg", true],
    ["Aluminum Roofing Sheets (0.45mm)", "aluminum-roofing-sheets-045mm",
     "High-quality aluminum roofing sheets with corrugated profile. Thickness: 0.45mm. Color: Terracotta. Length: 3.6m per sheet. Weather-resistant and durable.",
     "0.45mm corrugated, terracotta, 3.6m", 11, 8500, "14.17", 10000, "ROOF-ALU-045-TC",
     "AluRoof", "Aluminum", "3.6m x 0.9m per sheet", "3.2 kg/sheet", "Cameroon", 1000, "4.6", 89,
     "/uploads/products/roofing-sheets.jpg", true],
    ["Men's Premium Cotton Polo Shirt", "mens-premium-cotton-polo",
     "Premium 100% cotton polo shirt with classic fit. Available in navy, black, white, and grey. Pique knit fabric, 3-button placket, ribbed collar and cuffs.",
     "100% cotton, classic fit, 4 colors", 4, 12000, "20.00", 15000, "FASH-MEN-POLO-01",
     "CamerStyle", "100% Cotton", "S-XXL", "200g", "Cameroon", 150, "4.4", 78,
     "/uploads/products/polo-shirt.jpg", true],
    ["Sony 55-inch 4K Smart TV", "sony-55-inch-4k-smart-tv",
     "Sony Bravia XR-55X90L 55-inch 4K HDR Smart TV with Cognitive Processor XR, Full Array LED, Google TV, Dolby Vision & Atmos support.",
     "55-inch 4K HDR, Google TV, Cognitive XR", 1, 450000, "750.00", 520000, "TV-SNY-55-X90L",
     "Sony", "Metal/Plastic", "123.3 x 71.3 x 7.2 cm", "16.8 kg", "Japan", 12, "4.7", 92,
     "/uploads/products/sony-tv.jpg", true],
    ["High-Gloss Kitchen Cabinet Set", "high-gloss-kitchen-cabinet-set",
     "Modern high-gloss white kitchen cabinet set. Includes base cabinets, wall cabinets, and island. Soft-close hinges, soft-touch handles, durable MDF construction.",
     "High-gloss white, soft-close, modern design", 10, 350000, "583.33", 420000, "FURN-KIT-HG-01",
     "KitchenPro", "MDF High-Gloss", "Customizable L-shape", "120 kg total", "Turkey", 8, "4.8", 34,
     "/uploads/products/kitchen-cabinet.jpg", true],
    ["Baby Stroller with Car Seat", "baby-stroller-with-car-seat",
     "3-in-1 baby travel system with stroller, car seat, and carrycot. Grey color, lightweight aluminum frame, 5-point harness, adjustable handlebar, large storage basket.",
     "3-in-1 travel system, grey, lightweight", 5, 85000, "141.67", 105000, "BABY-STR-3IN1-01",
     "BabyComfort", "Aluminum/Fabric", "92 x 56 x 110 cm", "9.5 kg", "China", 20, "4.6", 56,
     "/uploads/products/baby-stroller.jpg", true],
  ];

  for (const p of prods) {
    await conn.query(
      `INSERT INTO products (name, slug, description, short_description, category_id, price_fcfa, price_usd, compare_price, sku, brand, material, dimensions, weight, origin, stock_quantity, rating, review_count, featured_image, is_featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      p
    );
  }
  console.log("Inserted 10 products");

  // Update product counts
  await conn.execute("UPDATE categories SET product_count = 3 WHERE id = 11");
  await conn.execute("UPDATE categories SET product_count = 1 WHERE id IN (1,2,3,4,5,6,10)");

  // Seed admin
  const passwordHash = await bcrypt.hash("khassy", 10);
  await conn.query(
    "INSERT INTO admin_users (username, password_hash, display_name, email, role, is_active) VALUES (?, ?, ?, ?, 'super_admin', true)",
    ["khassy", passwordHash, "Admin", "admin@camertrade.cm"]
  );
  console.log("Inserted admin user (khassy/khassy)");

  await conn.end();
  console.log("Seed complete!");
}

seed().catch((e) => { console.error(e); process.exit(1); });
