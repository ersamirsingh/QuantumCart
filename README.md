🚀 Tech Stack

Node.js + Express
MongoDB + Mongoose
TypeScript
JWT Authentication
Redis (optional caching)
MVC Architecture





✨ Core Features

🔐 Authentication & Roles
JWT-based authentication
Role-based access control (Customer / Seller / Admin)
Secure password hashing (bcrypt)

🛒 Cart System
Add / remove / update items
Transaction-safe operations
Server-side price validation

📍 Address Management
Embedded address subdocuments
Add / update / delete / fetch addresses
Ownership validation

🧾 Order System
Immutable snapshot pattern
priceAtPurchase & sellerId frozen at checkout
Server-side total calculation
Safe address selection using $elemMatch

🧠 Architecture Highlights
RESTful API design
Clean MVC structure
Proper schema indexing
Minimal .populate() usage
Optimized MongoDB queries
Production-level error handling




📂 Project Structure
src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── config/
 └── utils/
 └── serverr.ts
