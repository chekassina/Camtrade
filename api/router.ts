import { createRouter, publicQuery } from "./middleware";
import { categoryRouter } from "./routers/category";
import { productRouter } from "./routers/product";
import { adminRouter } from "./routers/admin";
import { orderRouter } from "./routers/order";
import { messageRouter } from "./routers/message";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  category: categoryRouter,
  product: productRouter,
  admin: adminRouter,
  order: orderRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
