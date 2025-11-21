// db.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI; // set this in your .env, NOT in code
const options = {
  // Recommended stable API options (optional)
  serverApi: {
    version: "1"
  }
};

let client;
let db;

export async function connectDB() {
  if (db) return db; // already connected
  if (!uri) throw new Error("MONGO_URI not set in environment");

  client = new MongoClient(uri, options);
  await client.connect();
  // use DB name from env or default
  const dbName = process.env.DB_NAME || "cwDatabase";
  db = client.db(dbName);
  console.log("Connected to MongoDB Atlas (db:", dbName + ")");
  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}
