# Njia CommunityHub

**Njia CommunityHub** is a full-stack, community-driven commuter information-sharing platform built for everyday travellers across Nairobi and surrounding transport corridors (Thika Road, Mombasa Road, Ngong Road, Waiyaki Way, Kiambu Road, Jogoo Road, and Eastern Bypass).

Commuters can post and check user-submitted updates on **current traffic conditions**, **matatu/bus fares in KSh**, **stage queues**, and **road delays**, ask follow-up questions in threaded comments, mark helpful reports, and flag inaccurate or unsafe posts.

> **Transparency Principle:** All traffic and fare updates on Njia CommunityHub are user-submitted and are never falsely labelled as "verified" or "live". Updates older than 2 hours display a clear freshness warning.

---

## Core Features

- **Authentication & Role Security:** JWT authentication, `bcryptjs` password hashing, protected frontend routes, ownership checks, and an `admin` role for safety moderation.
- **Community Route Feed:** Filter updates by route/corridor, traffic condition (`Smooth`, `Slow`, `Gridlock`), or stage keyword; sorted newest-first with pagination.
- **Create, Edit & Delete Route Updates:** Full CRUD backed by MongoDB Atlas with fare validation in KSh and custom route support (`Other`).
- **Threaded Comments & Helpful Votes:** Ask commuters on the road about alternative lanes or queues, reply to comments, and upvote helpful updates.
- **Commuter Profiles:** View and edit full name, avatar URL, main commuting route, bio, and post history.
- **Safety & Admin Moderation:** Report misleading or inappropriate posts; administrators can review reports, remove posts, and suspend/reinstate accounts.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, JavaScript (ES2023), Tailwind CSS 3, React Router 6, Lucide React, Axios |
| **Backend** | Node.js (v20+), Express.js 4, JWT (`jsonwebtoken`), `bcryptjs`, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB Atlas, Mongoose 8 |
| **Testing** | Node.js Built-in Test Runner (`node:test`), Supertest, MongoDB Memory Server |
| **Deployment** | Frontend on **Vercel**, Backend on **Render**, Database on **MongoDB Atlas** |

---

## Folder Structure

```text
njia-communityhub/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile session
│   │   ├── commentController.js  # Threaded comments & deletion
│   │   ├── postController.js     # Route updates CRUD & helpful votes
│   │   ├── reportController.js   # Safety reporting & admin moderation
│   │   └── userController.js     # Public & personal profile management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & admin guard
│   │   ├── errorHandler.js       # Centralised error & 404 formatting
│   │   └── validate.js           # MongoDB ObjectId validation
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Post.js
│   │   ├── Report.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── postRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── tests/
│   │   └── api.test.js           # Automated API integration tests
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── jwt.js
│   │   └── seed.js               # Sample Nairobi commuter seed script
│   ├── .env.example
│   ├── app.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── DEPLOYMENT.md
├── PRESENTATION.md
├── README.md
├── TEAM_GUIDE.md
└── TESTING.md
```

---

## Local Installation & Setup

### Prerequisites
- **Node.js** v20.0.0 or higher (`node -v`)
- **npm** v10+ (`npm -v`)
- A **MongoDB Atlas** cluster (or local MongoDB instance)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and add your MONGODB_URI and a strong JWT_SECRET
npm install
npm run seed   # Optional: populates sample commuters, route updates & admin user
npm run dev    # Starts API server on http://localhost:5000
```

### 2. Frontend Setup
Open a second terminal:
```bash
cd frontend
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:5000/api
npm install
npm run dev    # Starts Vite dev server on http://localhost:5173
```

### 3. Run Automated Backend Tests
```bash
cd backend
npm test
```

---

## REST API Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Health check and route/status constants |
| `POST` | `/api/auth/register` | Public | Register a new commuter account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile |
| `POST` | `/api/auth/logout` | Public | Acknowledge logout |
| `GET` | `/api/users/:id` | Public | View public commuter profile and post history |
| `PUT` | `/api/users/me` | Protected | Update own profile details |
| `GET` | `/api/posts` | Public | List route updates (supports `route`, `trafficStatus`, `search`, `page`, `limit`) |
| `POST` | `/api/posts` | Protected | Publish a new route update |
| `GET` | `/api/posts/:id` | Public | View single route update |
| `PUT` | `/api/posts/:id` | Owner | Edit own route update |
| `DELETE` | `/api/posts/:id` | Owner/Admin | Delete route update |
| `POST` | `/api/posts/:id/helpful` | Protected | Toggle helpful upvote on a post |
| `GET` | `/api/posts/:id/comments` | Public | List comments and replies on a post |
| `POST` | `/api/posts/:id/comments` | Protected | Add a comment or reply |
| `DELETE` | `/api/comments/:id` | Owner/Admin | Delete own comment |
| `POST` | `/api/reports` | Protected | Report a post for moderation review |
| `GET` | `/api/admin/reports` | Admin | View moderation queue and platform stats |
| `PATCH` | `/api/admin/reports/:id` | Admin | Remove reported post or dismiss report |
| `PATCH` | `/api/admin/users/:id/suspend` | Admin | Suspend or reinstate a user account |
