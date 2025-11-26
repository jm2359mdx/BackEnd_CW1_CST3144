// db.js
// mongo client import
import { MongoClient } from "mongodb";

// connection URI from .env
const uri = process.env.MONGO_URI;

// driver options
const options = {
  serverApi: { version: "1" }
};

let client;
let db;

// open connection and select database
export async function connectDB() {
  if (db) return db;
  if (!uri) throw new Error("MONGO_URI not set in environment");

  client = new MongoClient(uri, options);
  await client.connect();

  const dbName = process.env.DB_NAME || "cwDatabase";
  db = client.db(dbName);
  console.log("Connected to MongoDB Atlas (db:", dbName + ")");
  return db;
}

// return active db instance
export function getDB() {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

// close client + reset references
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}
