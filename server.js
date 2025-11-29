// core imports
import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  // connect database and start server
  connectDB,
  getDB,
  closeDB,
} from "./db.js";
import logger from "./middleware/logger.js";
import staticFiles from "./middleware/static.js";
import { ObjectId } from "mongodb";

// create server app
const app = express();

/* essential note */

// CORS: allow GH Pages frontend and Render backend, handle preflight quickly.
// permit requests without Origin (curl, server-to-server)
const allowedOrigins = [
  "https://jm2359mdx.github.io",
  "https://jm2359mdx.github.io/FrontEnd_CW1_CST3144",
  // backend origin (useful if the frontend ever calls the API from same host)
  "https://backend-cw1-cst3144-1.onrender.com",
];



const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Dev-friendly defaults when NODE_ENV !== "production"
if (process.env.NODE_ENV !== "production") {
  envOrigins.push("http://localhost:5173", "http://localhost:3000");
}

// Example: ALLOWED_ORIGINS="https://jm2359mdx.github.io,https://jm2359mdx.github.io/FrontEnd_CW1_CST3144,https://backend-cw1-cst3144-1.onrender.com"
// const allowedOrigins = Array.from(new Set(envOrigins));

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // don't throw an error here (that becomes a 500). Instead deny the origin:
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204, // older browsers like IE11
  credentials: true, // set true only if you need cookies/auth and then don't use '*' origin
};

app.use(cors(corsOptions));
// ensure preflight is handled with the same options


// JSON body parsing (small body limit to guard against large payloads).
app.use(
  // parse json bodies
  express.json({ limit: "10kb" })
);

// Trim stray CR/LF from incoming URLs to avoid routing issues from some clients.
app.use((req, res, next) => {
  if (typeof req.url === "string") {
    req.url = req.url.replace(/[\r\n]+$/g, "");
  }
  next();
});

// Simple request logger applied globally so all routes are visible in server logs.
// log each request
app.use(logger);

// Serve lesson images from /images. Returns JSON 404 when file is missing (coursework requirement).
// serve lesson images
app.use("/images", staticFiles);

// ------------------------ ROUTES ------------------------

// Return all lessons used by the front-end list and as a fallback for empty searches.
// fetch all lessons
app.get("/lessons", async (req, res) => {
  try {
    const db = getDB();
    const lessons = await db.collection("lessons").find().toArray();
    res.json(lessons);
  } catch (err) {
    console.error("GET /lessons error:", err);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// Server-side search for subject/location and numeric fields (price / spaces). Empty q returns all.
// search lessons
app.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const db = getDB();

    if (!q) {
      const lessons = await db.collection("lessons").find().toArray();
      return res.json(lessons);
    }

    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    const asNumber = Number(q);
    const isNumeric = !Number.isNaN(asNumber);

    const or = [
      { subject: { $regex: regex } },
      { location: { $regex: regex } },
    ];

    if (isNumeric) {
      // Check both `spaces` and `space` for robustness against dataset naming.
      or.push({ price: asNumber });
      or.push({ spaces: asNumber });
      or.push({ space: asNumber });
    }

    const results = await db.collection("lessons").find({ $or: or }).toArray();
    return res.json(results);
  } catch (err) {
    console.error("GET /search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Receive an order payload and persist it to the orders collection.
// save new order
app.post("/orders", async (req, res) => {
  try {
    const db = getDB();
    const order = req.body;

    // Basic validation to ensure required fields are present.
    if (
      !order ||
      typeof order.name !== "string" ||
      typeof order.phone !== "string" ||
      !Array.isArray(order.items) ||
      order.items.length === 0
    ) {
      return res.status(400).json({ error: "Invalid order payload" });
    }

    const result = await db.collection("orders").insertOne(order);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update any fields of a lesson document using $set; accepts ObjectId or string id.
// update lesson by id
app.put("/lessons/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    let filter;
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { _id: id };
    }

    const update = req.body;
    if (!update || typeof update !== "object") {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    const result = await db
      .collection("lessons")
      .updateOne(filter, { $set: update });

    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    console.error("PUT /lessons/:id error:", err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

// --------------------- START SERVER ---------------------
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close();
      await closeDB();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((err) => {
    console.error("Failed to connect to DB -- exiting", err);
    process.exit(1);
  });
