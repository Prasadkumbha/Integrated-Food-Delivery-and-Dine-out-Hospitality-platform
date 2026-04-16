# 📅 Week 1 — Backend Setup & Authentication

## 🧠 What We Built & Why

### 🏗️ 1. MVC Architecture

We structured the backend using the MVC pattern:

* **Models** — Define database schema (data structure)
* **Controllers** — Handle business logic
* **Routes** — Define API endpoints
* **Middleware** — Runs between request & controller (e.g., authentication)

**Why MVC?**
It keeps the code clean, scalable, and easy to maintain as the project grows.

---

### 🗄️ 2. MongoDB Models (Schemas)

#### 👤 User Model

* Stores: `name`, `email`, `password`, `role`
* Roles: `customer`, `restaurant_owner`, `courier`, `admin`
* Passwords are hashed using **bcrypt**
* Uses `pre('save')` hook for automatic hashing

---

#### 🍽️ Restaurant Model

* Stores restaurant details + location
* Uses **GeoJSON format**:

  ```json
  { "type": "Point", "coordinates": [longitude, latitude] }
  ```
* Uses `2dsphere` index for location-based queries

⚠️ MongoDB uses `[longitude, latitude]` (opposite of Google Maps)

---

#### 📋 MenuItem Model

* Linked to restaurant using `ObjectId`
* Has `isAvailable` field for toggling availability
* Uses reference: `ref: 'Restaurant'`

---

#### 🛒 Order Model

* Most complex model
* Includes embedded `orderItemSchema` (snapshot of item name & price)
* Order status flow:

  ```
  Pending → Accepted → Preparing → Ready → In Transit → Delivered
  ```
* Includes:

  * Review system (future use)
  * Courier location tracking

---

### 🔐 3. Authentication System

#### 🔑 Password Hashing (bcrypt)

* Passwords are never stored in plain text


#### 🪪 JWT (JSON Web Token)

* Token sent after login
* Contains:

  ```json
  { "id": "...", "role": "...", "iat": "...", "exp": "..." }
  ```
* Sent in headers:

  ```
  Authorization: Bearer <token>
  ```
* Verified using `JWT_SECRET`
* Token expiry: **7 days**

---

#### 🛡️ Auth Middleware

* `protect` → verifies token
* `authorizeRoles` → role-based access control

---

### 🌐 4. REST API Endpoints

| Method | Endpoint           | Access    | Purpose                  |
| ------ | ------------------ | --------- | ------------------------ |
| POST   | /api/auth/register | Public    | Register new user        |
| POST   | /api/auth/login    | Public    | Login & get token        |
| GET    | /api/auth/me       | Protected | Get current user details |

---

### ⚙️ 5. Environment Variables

* Stored in `.env` file

⚠️ `.env` is never pushed to GitHub (added in `.gitignore`)
