import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import jwt from "jsonwebtoken";

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin?: string) =>
  !origin || allowedOrigins.includes(origin);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error("Socket origin not allowed"));
    },
    credentials: true
  }
});

(app as any).io = io;
app.set("trust proxy", 1);

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({
  ok: true,
  service: "ngl-anonymous-api",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

io.on("connection", socket => {
  const cookieHeader = socket.handshake.headers.cookie || "";
  const cookieToken = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith("ngl_token="))
    ?.slice("ngl_token=".length);
  const token = socket.handshake.auth?.token || cookieToken;
  if (!token) return;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    socket.join(`user:${decoded.userId}`);
  } catch {}
});

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err?.status || 500).json({ message: "Something went wrong." });
});

async function start() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required.");

  await mongoose.connect(process.env.MONGO_URI);

  const port = Number(process.env.PORT || 5000);
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`API listening on port ${port}`);
  });
}

start().catch(err => {
  console.error("Startup failed:", err);
  process.exit(1);
});
