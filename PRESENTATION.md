# Project Presentation Guide – Njia CommunityHub

## 1. Project Introduction
**Njia CommunityHub** is a community-powered web platform where daily commuters share practical transport updates—matatu fares, traffic bottlenecks, stage queues, and road delays—along shared commuting corridors.

---

## 2. Problem Statement
Every morning and evening in cities like Nairobi, commuters step out without knowing:
- Whether fares on their corridor have suddenly hiked from KSh 70 to KSh 150.
- Where accidents, stalled vehicles, or rain have caused severe gridlocks.
- Whether matatu stages have long queues or smooth boarding.

Existing navigation maps show road colours, but they do not tell you **matatu fares**, **stage queues**, or **which sacco is boarding fastest**.

---

## 3. Proposed Solution
Njia CommunityHub crowdsources short, structured route reports from commuters already on the road:
- Structured by **Corridor** (Thika Road, Mombasa Road, Ngong Road, Waiyaki Way, etc.), **Fare in KSh**, and **Traffic Status** (`Smooth`, `Slow`, `Gridlock`).
- **Honest by design:** Clearly marks all reports as user-submitted and flags updates older than 2 hours so commuters are never misled.
- **Interactive Q&A:** Commuters ask follow-up questions in comments and upvote helpful reports.

---

## 4. System Architecture
- **Client (React + Vite + Tailwind CSS):** Mobile-first single-page application hosted on **Vercel**. Communicates with the backend via Axios with automatic JWT Bearer token attachment.
- **API Server (Node.js + Express.js):** RESTful API hosted on **Render** featuring JWT authentication, role-based access control (`user` vs `admin`), Helmet security headers, rate limiting, and centralised error handling.
- **Database (MongoDB Atlas + Mongoose):** Cloud document database storing `Users`, `Posts`, `Comments`, and `Reports` with indexed queries for fast route/status filtering.

---

## 5. Live Demonstration Flow (5 Minutes)
1. **Landing Page (`/`):** Highlight the commuter value proposition and quick-jump route cards.
2. **Community Feed (`/feed`):** Filter by **Thika Road**, point out the fare badge (`KSh 100`), traffic badge (`Slow`), and timestamp freshness indicator.
3. **Register / Log In & Share Update (`/share`):** Publish a new route update live and show it appearing immediately in the feed.
4. **Community Discussion (`/posts/:id`):** Mark a post **Helpful**, post a comment/reply, and edit/delete your own post.
5. **Profile & Safety Moderation (`/profile` & `/admin`):** Show personal update history, report a misleading post, and demonstrate how an admin reviews and removes flagged content.

---

## 6. Future Improvements
- **Route Subscriptions & Push Alerts:** Notify commuters before their morning/evening departure window when gridlock is reported on their saved main route.
- **Sacco & Stage Tagging:** Structured tags for major stages (e.g., Roysambu, Cabanas, Adams Arcade) and saccos.
- **Reputation Badges:** Recognise consistent, helpful commuter contributors over time.
