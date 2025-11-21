import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lessonsDir = path.join(__dirname, "../public/lessons");

export default function staticFiles(req, res) {
  // req.path might be '/math.png' -> remove leading slash
  const filePath = path.join(lessonsDir, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Image not found" });
  }
}
