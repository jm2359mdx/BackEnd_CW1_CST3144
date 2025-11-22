// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, getDB, closeDB } from "./db.js";
import logger from "./middleware/logger.js";
import staticFiles from "./middleware/static.js";
import { ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" })); // prevent huge bodies

// sanitize incoming req.url (removes stray CR/LF so Postman works)
app.use((req, res, next) => {
  if (typeof req.url === "string") {
    req.url = req.url.replace(/[\r\n]+$/g, "");
  }
  next();
});

app.use(logger);
app.use("/images", staticFiles);

//
// ------------------------ ROUTES ------------------------
//

// GET /lessons  (required by Coursework)
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


// ------------------------ SEARCH ROUTE ------------------------
// GET /search?q=term
app.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    const db = getDB();

    // If empty search → return all lessons
    if (!q) {
      const lessons = await db.collection("lessons").find().toArray();
      return res.json(lessons);
    }

    // Escape regex special characters
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");

    // Allow numeric search for price/spaces if q is number-like
    const asNumber = Number(q);
    const isNumeric = !Number.isNaN(asNumber);

    const or = [
      { subject: { $regex: regex } },
      { location: { $regex: regex } }
    ];

    if (isNumeric) {
      or.push({ price: asNumber });
      or.push({ spaces: asNumber });
    }

    const results = await db.collection("lessons").find({ $or: or }).toArray();
    return res.json(results);

  } catch (err) {
    console.error("GET /search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});


// ------------------------ POST ORDER ------------------------
// POST /orders (required by Coursework)
app.post("/orders", async (req, res) => {
  try {
    const db = getDB();
    const order = req.body;

    // Very basic validation
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


// ------------------------ UPDATE LESSON ------------------------
// PUT /lessons/:id (required by Coursework)
app.put("/lessons/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    // Try to convert to ObjectId
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

    const result = await db.collection("lessons")
      .updateOne(filter, { $set: update });

    res.json({
      matched: result.matchedCount,
      modified: result.modifiedCount
    });

  } catch (err) {
    console.error("PUT /lessons/:id error:", err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});


//
// --------------------- START SERVER ---------------------
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // graceful shutdown
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
