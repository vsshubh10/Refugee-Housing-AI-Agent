// backend/routes/blueprintRoutes.js
import express from "express";
import { generateBlueprint } from "../services/genaiService.js";
import BlueprintModel from "../models/Blueprint.js";

const router = express.Router();

// Generate endpoint
router.post("/generate", async (req, res) => {
  try {
    const { location, materials, climate, culture, budget } = req.body;

    // basic validation
    if (!location || !materials) {
      return res.status(400).json({ ok: false, error: "location and materials required" });
    }

    // Call GenAI service
    const genaiResult = await generateBlueprint({ location, materials, climate, culture, budget });

    // Save to DB
    const id = await BlueprintModel.create({
      location,
      materials: Array.isArray(materials) ? materials.join(", ") : materials,
      climate: climate || "",
      culture: culture || "",
      budget: budget || "",
      plan: genaiResult
    });

    res.json({ ok: true, id, plan: genaiResult });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// list endpoint
router.get("/list", async (req, res) => {
  try {
    const rows = await BlueprintModel.all();
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
