// seed.js
import 'dotenv/config';
import { connectDB, getDB, closeDB } from "./db.js";


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
    await connectDB();
    const db = getDB();

    // Clear the old lessons collection
    await db.collection("lessons").deleteMany({});

    // Insert the new lessons
    const result = await db.collection("lessons").insertMany(lessons);

    console.log("Inserted lessons:", result.insertedCount);
  } catch (err) {
    console.error(err);
  } finally {
    await closeDB();
  }
}

run();
