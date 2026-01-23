import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import http from "http";

import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

import { clerkMiddleware } from "@clerk/express";

import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

import { initSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);

// 🔥 INIT SOCKET BEFORE ANY MIDDLEWARE
initSocket(server);

await connectDB();

app.use(cors());
app.use(express.json());

// ❌ clerkMiddleware globally mat lagao
// app.use(clerkMiddleware()); ❌

// ✅ Apply Clerk ONLY on API routes
app.use("/api", clerkMiddleware());

app.get("/", (req, res) => res.send("server is running"));

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () =>
  console.log(`server is running on port ${PORT}`)
);
