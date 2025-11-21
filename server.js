// server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB, getDB, closeDB } from "./db.js";
import logger from "./middleware/logger.js";
import staticFiles from "./middleware/static.js";
import { ObjectId } from "mongodb";


const app = express();
app.use(cors());
app.use(express.json());

// sanitize incoming req.url (remove trailing CR/LF characters)
app.use((req, res, next) => {
  // remove trailing CR or LF characters from the raw url
  if (typeof req.url === 'string') {
    req.url = req.url.replace(/[\r\n]+$/g, '');
  }
  next();
});


app.use(logger);
app.use("/images", staticFiles);

// --- routes ---

// GET /lessons
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

// POST /orders
app.post("/orders", async (req, res) => {
  try {
    const db = getDB();
    const order = req.body;
    // basic validation (extend as needed)
    if (!order || !order.name || !order.phone || !Array.isArray(order.items) || order.items.length === 0) {
      return res.status(400).json({ error: "Invalid order payload" });
    }
    const result = await db.collection("orders").insertOne(order);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PUT /lessons/:id  (update any lesson fields; typically used to update spaces)
app.put("/lessons/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    // accept either ObjectId or string ids depending on how you seeded lessons
    let filter;
    try {
      filter = { _id: new ObjectId(id) };
    } catch (e) {
      // if id is not a valid ObjectId, fall back to string match
      filter = { _id: id };
    }

    const update = req.body;
    if (!update || Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No update payload provided" });
    }

    const result = await db.collection("lessons").updateOne(filter, { $set: update });
    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    console.error("PUT /lessons/:id error:", err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

// start server after DB is ready
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
