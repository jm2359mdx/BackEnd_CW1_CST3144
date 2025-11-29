// seed.js
// load env + db helpers
import "dotenv/config";
import { connectDB, getDB, closeDB } from "./db.js";

// a collection for lesson information (minimal fields: topic, price, location, and space) 
const lessons = [
  { subject: "Math", location: "London", price: 15, spaces: 8 },
  { subject: "English", location: "Leeds", price: 12, spaces: 5 },
  { subject: "Science", location: "Bristol", price: 18, spaces: 5 },
  { subject: "Art", location: "London", price: 10, spaces: 5 },
  { subject: "Music", location: "Oxford", price: 20, spaces: 5 },
  { subject: "PE", location: "Bath", price: 9, spaces: 5 },
  { subject: "Coding", location: "London", price: 22, spaces: 5 },
  { subject: "Robotics", location: "Cardiff", price: 25, spaces: 5 },
  { subject: "Drama", location: "Leeds", price: 11, spaces: 5 },
  { subject: "History", location: "Manchester", price: 14, spaces: 5 }
];

async function run() {
  try {
    // connect to database
    await connectDB();
    const db = getDB();

    // reset lessons collection
    await db.collection("lessons").deleteMany({});

    // insert fresh dataset
    const result = await db.collection("lessons").insertMany(lessons);

    console.log("Inserted lessons:", result.insertedCount);
  } catch (err) {
    console.error(err);
  } finally {
    // close db connection
    await closeDB();
  }
}

// run seeding
run();
