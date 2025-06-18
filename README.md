# 🔐 Auth System with Guards (User, Admin, Vendor) – Node.js + TypeScript + Express

## 📦 Overview

This project is a backend authentication system built with **Node.js**, **Express**, and **TypeScript**, integrated with **MongoDB** via **Mongoose**.

We’ve implemented a flexible guard-based authentication structure (like Laravel), allowing login and access based on different roles: `user`, `admin`, and `vendor`.

---

## 🚀 Features

- 🔑 **Authentication with JWT**
- 👮‍♂️ **Guard-based Login** (`user`, `admin`, `vendor`)
- 🔐 `authGuard` Middleware to protect routes
- 🔁 Password hashing using `bcryptjs`
- 🔍 Search & Pagination for users
- 📄 Profile endpoint for authenticated users
- 📦 Clean modular folder structure
- 📊 Reusable pagination helper
- 📁 Environment config with `.env`

---

## 📁 Folder Structure

├── controllers/ # Business logic
│ └── UserController.ts
├── middleware/ # authGuard middleware
│ └── authGuard.ts
├── models/ # Mongoose models
│ ├── User.ts
│ ├── Admin.ts
│ └── Vendor.ts
├── helpers/ # Utility functions
│ ├── function.ts
│ └── pagination.ts
├── routes/ # Express routes
│ └── userRoutes.ts
├── index.ts # Entry point (Express + MongoDB)
└── types/ # Custom TS types (e.g. AuthRequest)

---

## 🔐 Guards Explained

We mimic Laravel's guard system using:

```ts
const GUARD_MODELS = {
  user: User,
  admin: Admin,
  vendor: Vendor,
};
```

Reusable helper to paginate any Mongoose model:

Pagination(model, query, page, limit, select, sort)

{
data: [...],
currentPage,
totalPages,
totalItems
}

🛡️ JWT Auth + Middleware

Token is stored in Authorization: Bearer <token>

authGuard middleware decodes the token and fetches the user from DB based on guard

🧪 Environment Variables

Use a .env file in the root:

PORT=5000
JWT_SECRET=your_secret_key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/db

🧑‍💻 Future Improvements

Refresh Tokens

Role-based permissions

Email verification

Password reset flow

🛠️ Technologies Used

Node.js + Express

TypeScript

MongoDB + Mongoose

JWT + bcrypt

dotenv
