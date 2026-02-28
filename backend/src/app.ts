import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import variantsRouter from "./routes/variants.js";
import { sendError } from "./lib/http.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/variants", variantsRouter);

// Final fallback to guarantee consistent JSON error shape.
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return sendError(res, 500, message);
  }
);

export default app;
