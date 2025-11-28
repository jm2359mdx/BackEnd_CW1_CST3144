# 🌟 LearnEase – Backend (BackEnd_CW1_CST3144)

This is the backend API for **LearnEase**, a full-stack coursework project built for CST3144.  
It provides all data and logic required by the Vue.js frontend, including lesson retrieval, order processing, space updates, logging, and search.

---

## 🌐 Live Backend URL

**[https://backend-cw1-cst3144-1.onrender.com](https://backend-cw1-cst3144-1.onrender.com)**

---

## 🚀 Tech Stack

- **Node.js** (native ES modules)
- **Express.js** (REST API)
- **MongoDB Atlas** (native Node.js driver)
- **Render.com** (backend hosting)
- **Custom middleware**: logger, static file handler

---

## 📁 Project Structure

- `CST3144-BackEnd/`
  - `middleware/`
      - `logger.js`
      - `static.js`
  - `server.js`
  - `db.js`
  - `seed.js`
  - `package.json`
  - `README.md`


---

## 🔌 Available API Routes

### 1️⃣ GET /lessons

Retrieve all lessons from MongoDB.

**Response:**


[
{
"_id": "...",
"subject": "Math",
"location": "London",
"price": 15,
"spaces": 8
}
]


---

### 2️⃣ GET /search?q=term

Full-text / partial search across:
- subject
- location
- price (numeric match)
- spaces (numeric match)

Used by the frontend search-as-you-type feature.

**Example:**
GET /search?q=math


---

### 3️⃣ POST /orders

Create a new order.

**Request Body:**
{
"name": "John Doe",
"phone": "07123456789",
"items": [
{
"lessonId": "12345",
"qty": 2
}
]
}


---

### 4️⃣ PUT /lessons/:id

Update lesson attributes (mainly spaces).

**Request Body:**
  {
"spaces": 3
}

---

## 🛠 Running Locally

### 1. Install dependencies
npm install

### 2. Add environment variables

Create a `.env` file:

MONGO_URI=your_atlas_connection_string
DB_NAME=cwDatabase
PORT=3000


### 3. Seed database (optional)
node seed.js

### 4. Start server
node server.js


**Server runs at:** [http://localhost:3000](http://localhost:3000)

---

## 🔍 Testing the API

### Get all lessons
GET http://localhost:3000/lessons

### Search lessons
GET http://localhost:3000/search?q=math


### Create an order
POST http://localhost:3000/orders
Content-Type: application/json

{
"name": "Test",
"phone": "123",
"items": [
{
"lessonId": "...",
"qty": 1
}
]
}


### Update lesson spaces
PUT http://localhost:3000/lessons/<id>
Content-Type: application/json

{
"spaces": 4
}


---

## 🧾 Coursework Requirements Covered

- [x] Node.js backend
- [x] Express.js REST API
- [x] Native MongoDB driver
- [x] Hosted on Render
- [x] Logger middleware (4%)
- [x] Static files middleware (4%)
- [x] GET /lessons (3%)
- [x] POST /orders (4%)
- [x] PUT /lessons/:id (5%)
- [x] Full backend search (7%)

---

## 📌 Notes

This backend is designed to work seamlessly with the LearnEase Vue.js frontend.  
All endpoints follow REST conventions and return JSON responses.
