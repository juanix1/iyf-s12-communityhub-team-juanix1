# Team Collaboration Guide – IYF Weekend Academy

This guide outlines a clean GitHub workflow so a 3–5 person team can build, test, and deploy **Njia CommunityHub** smoothly within a 2-day sprint.

---

## 1. Suggested Team Role Split

| Role | Primary Ownership | Key Files |
| :--- | :--- | :--- |
| **Tech Lead & Backend Architect** | Express setup, MongoDB models, Auth & Security | `backend/server.js`, `models/*`, `middleware/auth.js` |
| **Backend API & Testing Engineer** | Posts, Comments, Reports controllers & tests | `controllers/*`, `routes/*`, `tests/api.test.js` |
| **Frontend UI & Feed Developer** | Home, Feed filters, PostCard, responsive styling | `pages/HomePage.jsx`, `pages/FeedPage.jsx`, `PostCard.jsx` |
| **Frontend Forms & Auth Developer** | Login, Register, Share/Edit Post, Profile | `LoginPage.jsx`, `RegisterPage.jsx`, `PostFormPage.jsx`, `ProfilePage.jsx` |
| **QA, DevOps & Presentation Lead** | Seed data, Render/Vercel deployment, slide demo | `seed.js`, `DEPLOYMENT.md`, `PRESENTATION.md` |

---

## 2. GitHub Branching Strategy

Never push unfinished code directly to `main`. Keep `main` deployable at all times.

1. **Clone & pull latest `main`:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create a descriptive feature branch:**
   ```bash
   git checkout -b feat/feed-route-filters
   # Naming prefixes: feat/, fix/, docs/, test/
   ```
3. **Commit small, clear milestones:**
   ```bash
   git add .
   git commit -m "feat(feed): add route and traffic status filter controls"
   git push -u origin feat/feed-route-filters
   ```

---

## 3. Pull Requests & Code Review Checklist

When opening a Pull Request (PR) into `main`, the reviewer checks:
- [ ] No `.env` files, API keys, or hardcoded passwords are included in the diff.
- [ ] Backend tests pass (`cd backend && npm test`).
- [ ] Frontend builds without errors (`cd frontend && npm run build`).
- [ ] New UI components work cleanly on mobile screen widths (375px) as well as desktop.
- [ ] Error states and loading indicators are handled gracefully.

---

## 4. Two-Day Sprint Schedule

- **Day 1 Morning:** Repo setup, MongoDB Atlas cluster creation, `.env` configuration, seed database locally.
- **Day 1 Afternoon:** Verify Auth, Feed, Post CRUD, and Comments locally end-to-end.
- **Day 2 Morning:** Test Admin moderation, mobile responsiveness, and edge cases (`TESTING.md`).
- **Day 2 Afternoon:** Deploy backend to Render, frontend to Vercel, run smoke tests on live URLs, and rehearse presentation (`PRESENTATION.md`).
