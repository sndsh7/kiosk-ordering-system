import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { adminRouter } from "./routes/admin.js";
import { kioskRouter } from "./routes/kiosk.js";
import { catalogRouter } from "./routes/catalog.js";
import { entitiesRouter } from "./routes/entities.js";
import { ordersRouter } from "./routes/orders.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});
const app = express();
const httpServer = createServer(app);

const origins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);

const io = new SocketIOServer(httpServer, {
  cors: { origin: origins.length ? origins : true }
});

app.use(cors({ origin: origins.length ? origins : true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/admin", adminRouter);
app.use("/api/kiosk", kioskRouter);
app.use("/api", catalogRouter);
app.use("/api", ordersRouter);
app.use("/api", entitiesRouter);

io.on("connection", (socket) => {
  socket.emit("connected", { ok: true });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
