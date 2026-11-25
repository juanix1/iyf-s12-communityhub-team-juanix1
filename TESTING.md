# Testing & Quality Assurance Plan – Njia CommunityHub

## 1. Automated Backend API Tests

The backend includes an automated integration test suite using Node's built-in test runner, `supertest`, and an in-memory MongoDB instance (`mongodb-memory-server`) so tests run offline without affecting your Atlas database.

Run the suite:
```bash
cd backend
npm test
```

### Covered Automated Scenarios (`backend/tests/api.test.js`)
1. **User Registration:** Creates a user, hashes password (`password` omitted from JSON response), and issues a JWT.
2. **User Login:** Authenticates with valid email/username and password.
3. **Endpoint Protection:** Rejects unauthenticated `POST /api/posts` with `401 Unauthorized`.
4. **Creating Posts:** Saves valid route update with fare in KSh and traffic status (`201 Created`).
5. **Fetching & Filtering Posts:** Queries `GET /api/posts?route=Thika%20Road&trafficStatus=Slow`.
6. **Editing Own Post:** Allows original author to update fare and status (`200 OK`).
7. **Ownership Authorization:** Blocks another user from editing or deleting someone else's post (`403 Forbidden`).
8. **Comments & Deletion:** Adds a comment, increments `commentCount`, and deletes own comment.
9. **Role-Based Admin Guard:** Blocks non-admin users from `GET /api/admin/reports` (`403 Forbidden`) and grants access once promoted to `admin`.
10. **Deleting Own Post:** Removes post cleanly (`200 OK`).

---

## 2. Manual End-to-End Test Checklist

### A. Authentication & Persistence
- [ ] Register a new account on `/register` and confirm redirect to `/feed`.
- [ ] Refresh the browser (`F5`) and verify you remain logged in via `/api/auth/me`.
- [ ] Log out and confirm `/share` and `/profile` redirect to `/login`.
- [ ] Attempt login with wrong password and confirm clear error banner appears.

### B. Route Updates (CRUD) & Stale Indicators
- [ ] Publish a post on `/share` with `Route = Thika Road`, `Fare = 100`, `Traffic = Slow`.
- [ ] Verify the post appears at the top of `/feed` with **"Community-submitted"** label.
- [ ] Edit your post and confirm updated fare/description saves in MongoDB.
- [ ] Verify seeded posts older than 2 hours display the amber/slate freshness notice.

### C. Comments, Helpful Votes & Profiles
- [ ] Open a post detail page (`/posts/:id`), add a comment, and post a nested reply.
- [ ] Click **Helpful** and verify the vote counter toggles immediately.
- [ ] Visit `/profile`, update your main route and bio, and verify changes persist after reload.

### D. Moderation & Admin Safety
- [ ] Log in as a regular user, click **Report** on another user's post, and submit a reason.
- [ ] Log in as an `admin` account (`admin@njiacommunity.co.ke` / `Password123!` if seeded).
- [ ] Open `/admin`, review the pending report, and test **Remove Post** or **Dismiss Report**.

### E. Mobile Responsiveness
- [ ] Open Chrome DevTools Device Toolbar (`375x812` iPhone SE / `390x844` iPhone 14).
- [ ] Confirm mobile hamburger menu opens/closes cleanly and cards stack without horizontal scrolling.
