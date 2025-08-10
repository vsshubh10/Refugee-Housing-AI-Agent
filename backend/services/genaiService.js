import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";

dotenv.config({ path: path.resolve("../.env") });

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("GOOGLE_API_KEY not set in .env");

// Initialize the new client
const genAI = new GoogleGenAI({ apiKey });

/**
 * generateBlueprint
 * Calls Google GenAI (Gemini) and returns a housing blueprint in point-wise and JSON format.
 */
export async function generateBlueprint({ location, materials, climate, culture, budget }) {
  const matText = Array.isArray(materials) ? materials.join(", ") : materials;

  const prompt = `
You are an experienced humanitarian architect. Provide a safe, practical, and culturally sensitive housing plan for refugees or disaster survivors.

Inputs:
- Location: ${location}
- Available materials: ${matText}
- Climate: ${climate || "unspecified"}
- Cultural preferences: ${culture || "none"}
- Budget: ${budget || "unspecified"}

Output in **two parts**:
1. **Point-wise human-readable format** with numbered sections:
   1. Overview
   2. Materials
   3. Layout description (no ASCII art, just text description of room arrangement and dimensions)
   4. Safety notes
   5. Cultural/budget adjustments
   6. Final recommendations

2. **JSON format**:
{
  "overview": "...",
  "materials": ["..."],
  "layout": [
    { "room": "Bedroom", "dimensions": "3m x 3m", "position": "adjacent to living area" },
    { "room": "Kitchen", "dimensions": "2.5m x 2m", "position": "next to dining" }
  ],
  "safety_notes": ["..."],
  "cultural_budget_adjustments": ["..."],
  "final_recommendations": "..."
}

Make sure:
- Dimensions are approximate and realistic based on budget, materials, and climate.
- No ASCII or pictorial representation, only text and JSON.
- Keep it human-readable in part 1, and machine-readable in part 2.
`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { type: "text", text: prompt }
    ]
  });

  const textOutput = response.candidates[0].content.parts[0].text.trim();
  return textOutput;
}

export default generateBlueprint;
