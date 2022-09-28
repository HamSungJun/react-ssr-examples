import express from "express";
import { createServer as createViteServer } from "vite";

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const { renderFromServer } = await vite.ssrLoadModule("/src/Server.tsx");
      const resultHtml = await renderFromServer(url);
      res
        .status(200)
        .set({ "Content-Type": "text/html; charset=utf-8" })
        .end(resultHtml);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(5173);
}

createServer();
