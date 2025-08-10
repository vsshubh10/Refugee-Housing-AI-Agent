import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("../.env") });

console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);