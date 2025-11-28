🌟 LearnEase – Backend  (BackEnd_CW1_CST3144)
This is the backend API for LearnEase, a full-stack coursework project built for CST3144.
It provides all data and logic required by the Vue.js frontend, including lesson retrieval, order processing, space updates, logging, and search.

🚀 Tech Stack
Node.js (native ES modules)
Express.js (REST API)
MongoDB Atlas (native Node.js driver)
Render.com (backend hosting)
Custom middleware: logger, static file handler

🌍 Live Backend URL
https://backend-cw1-cst3144-1.onrender.com

📦 Project Structure
CST3144-BackEnd/
│
├── server.js               # Main Express server + routes
├── db.js                   # MongoDB connection helpers (native driver)
├── seed.js                 # Script to seed the database
│
├── middleware/
│     ├── logger.js         # Logs all incoming requests
│     └── static.js         # Serves lesson images or fallback
│
├── package.json
└── README.md

🔌 Available API Routes
1. GET /lessons
Retrieve all lessons from MongoDB.
[
  { "_id": "...", "subject": "Math", "location": "London", "price": 15, "spaces": 8 },
  ...
]


2. GET /search?q=term

Full-text / partial search across:
subject
location
price (numeric match)
spaces (numeric match)
Used by the frontend search-as-you-type feature.

3. POST /orders
Create a new order.
{
  "name": "John Doe",
  "phone": "07123456789",
  "items": [
    { "lessonId": "12345", "qty": 2 }
  ]
}


4. PUT /lessons/:id
Update lesson attributes (mainly “spaces”).
{ "spaces": 3 }


🛠 Running Locally
1. Install dependencies
npm install

2. Add your environment variables
Create .env:
{
MONGO_URI=your_atlas_connection_string
DB_NAME=cwDatabase
PORT=3000
}

3. Seed database (optional)
node seed.js

4. Start server
node server.js

🔍 Testing the API (for coursework marks)
GET lessons
http://localhost:3000/lessons

Search
"http://localhost:3000/search?q=math"

POST order
POST http://localhost:3000/orders \
   "Content-Type: application/json" \
  '{"name":"Test","phone":"123","items":[{"lessonId":"...","qty":1}]}'

Update spaces
 PUT http://localhost:3000/lessons/<id> \
  "Content-Type: application/json" \
   '{"spaces": 4}'

🧾 Coursework Requirements Covered
✔ Node.js backend
✔ Express.js REST API
✔ Native MongoDB driver
✔ Hosted on Render
✔ Logger middleware (4%)
✔ Static files middleware (4%)
✔ GET /lessons (3%)
✔ POST /orders (4%)
✔ PUT /lessons/:id (5%)
✔ Full backend search (7%)
