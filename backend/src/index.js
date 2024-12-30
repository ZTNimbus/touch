import express from "express";
import { app, server } from "../lib/socket.js";
import authRoutes from "../routes/auth.route.js";
import messageRoutes from "../routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();

const _dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(_dirname, "../frontend", "dist", "index.html"));
  });
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log("Server is listening on port:", PORT);
  connectDB();
});