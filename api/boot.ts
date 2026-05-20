import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Static file serving for uploads
app.use("/uploads/*", async (c) => {
  const url = new URL(c.req.url);
  const filePath = join(process.cwd(), "public", url.pathname);
  try {
    const file = await import("fs/promises").then((m) => m.readFile(filePath));
    const ext = url.pathname.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    return new Response(file, {
      headers: { "Content-Type": mimeTypes[ext || ""] || "application/octet-stream" },
    });
  } catch {
    return c.notFound();
  }
});

// Image upload endpoint
app.post("/api/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: "Invalid file type. Only JPG, PNG, WEBP allowed." }, 400);
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({ success: false, error: "File too large. Max 5MB." }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 8);
    const baseName = `${timestamp}-${randomHex}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    // Full size (max 2000px on longest side)
    const fullPath = join(uploadDir, `${baseName}.${ext}`);
    await sharp(buffer)
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .toFile(fullPath);

    // Medium (400x400)
    const mediumPath = join(uploadDir, `${baseName}-m.${ext}`);
    await sharp(buffer)
      .resize(400, 400, { fit: "cover" })
      .toFile(mediumPath);

    // Thumbnail (150x150)
    const thumbPath = join(uploadDir, `${baseName}-t.${ext}`);
    await sharp(buffer)
      .resize(150, 150, { fit: "cover" })
      .toFile(thumbPath);

    const baseUrl = "/uploads/products";
    return c.json({
      success: true,
      url: `${baseUrl}/${baseName}.${ext}`,
      thumbnail: `${baseUrl}/${baseName}-t.${ext}`,
      medium: `${baseUrl}/${baseName}-m.${ext}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ success: false, error: "Upload failed" }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
