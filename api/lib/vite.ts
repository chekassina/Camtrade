import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // Serve assets
  app.use(
    "/assets/*",
    serveStatic({
      root: "./dist/public",
    })
  );

  // Serve other static files
  app.use(
    "/*",
    serveStatic({
      root: "./dist/public",
    })
  );

  // React SPA fallback
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";

    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }

    const indexPath = path.join(process.cwd(), "dist/public/index.html");
    const content = fs.readFileSync(indexPath, "utf-8");

    return c.html(content);
  });
}