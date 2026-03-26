import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import authRoutes from "./src/routes/auth.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
  app.use(clerkMiddleware());
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "secret-ai-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/user", userRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
