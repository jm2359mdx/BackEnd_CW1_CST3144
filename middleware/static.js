// static.js
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// build lessons directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lessonsDir = path.join(__dirname, "../public/lessons");

// serve images safely
export default function staticFiles(req, res) {
  try {
    // clean path to avoid traversal
    const requested = path.normalize(req.path).replace(/^(\.\.[/\\])+/ , "");

    const filePath = path.join(lessonsDir, requested);

    // ensure path stays within lessons directory
    if (!filePath.startsWith(lessonsDir)) {
      return res.status(400).json({ error: "Invalid image path" });
    }

    // return file if exists
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // missing file
    return res.status(404).json({ error: "Image not found" });

  } catch (err) {
    console.error("staticFiles error:", err);
    return res.status(500).json({ error: "Failed to serve image" });
  }
}
