// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import blueprintRoutes from "./routes/blueprintRoutes.js";
import { initDb } from "./database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure DB + folders
await initDb();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve frontend files

// API routes
app.use("/api/blueprints", blueprintRoutes);

// Static HTML routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/about.html"));
});

app.get("/generate", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/generate.html"));
});

app.get("/blueprints", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/blueprints.html"));
});

// Fallback route (for unknown URLs)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
