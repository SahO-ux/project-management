import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import connectDB from "./mongoDB/connect.js";
import { loadModules } from "./server/modules-loader.js";

// -------------------- Setup --------------------
dotenv.config({ quiet: true });
const app = express();

// -------------------- Middleware --------------------
const setupMiddleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ limit: "30mb", extended: true }));
  app.use(morgan("dev"));
  app.use(cors());
};
setupMiddleware(app);

// -------------------- Health Test Route --------------------
app.get("/", (req, res) => res.json("Hello"));

// -------------------- Server Startup --------------------
const startServer = async () => {
  try {
    // 1️⃣ Connect DB
    await connectDB();

    // 2️⃣ Load all modules (models + controllers + services + routes)
    await loadModules(app);

    // 3️⃣ Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () =>
      console.log(`🚀 SERVER LISTENING AT http://localhost:${PORT} 🚀`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
