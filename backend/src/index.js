import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.config.js";
import cors from "cors";
dotenv.config();
import { app, server } from "./config/socket.io.js";
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json({ limit: "10 mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// connectDB
connectDB();

// init routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
