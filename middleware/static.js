import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lessonsDir = path.join(__dirname, "../public/lessons");

export default function staticFiles(req, res) {
  try {
    // Normalize requested path and prevent directory traversal
    const requested = path.normalize(req.path).replace(/^(\.\.[/\\])+/, "");

    const filePath = path.join(lessonsDir, requested);

    // Ensure filePath is inside lessonsDir
    if (!filePath.startsWith(lessonsDir)) {
      return res.status(400).json({ error: "Invalid image path" });
    }

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ error: "Image not found" });
    }
  } catch (err) {
    console.error("staticFiles error:", err);
    return res.status(500).json({ error: "Failed to serve image" });
  }
}
