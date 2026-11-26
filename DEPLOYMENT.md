# Deployment Guide – Njia CommunityHub

This guide walks through deploying **Njia CommunityHub** across **MongoDB Atlas** (database), **Render** (Node/Express backend), and **Vercel** (React/Vite frontend).

---

## Step 1: MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0 Shared Cluster** in a nearby region (e.g., `eu-west-1` or `af-south-1`).
2. Under **Database Access**, click **Add New Database User**:
   - Choose **Password** authentication.
   - Create a username (e.g., `njia_admin`) and generate a strong password without special URI-breaking characters.
   - Grant **Read and write to any database** privileges.
3. Under **Network Access**, click **Add IP Address**:
   - For Render hosting, select **Allow Access from Anywhere (`0.0.0.0/0`)** (Render uses dynamic outbound IPs on free/starter tiers).
4. Click **Connect → Drivers → Node.js** and copy your connection string:
   ```text
   mongodb+srv://njia_admin:<password>@cluster0.xxxxx.mongodb.net/njia_communityhub?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend on Render

1. Push your `njia-communityhub` repository to GitHub.
2. Log in to [Render](https://render.com/) and click **New + → Web Service**.
3. Connect your GitHub repository and configure:
   - **Name:** `njia-communityhub-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add the following **Environment Variables** in Render:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = *(paste your MongoDB Atlas URI)*
   - `JWT_SECRET` = *(generate a 64-character random string)*
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = `https://your-frontend-project.vercel.app` *(update once Vercel URL is created)*
5. Click **Create Web Service**. Once deployed, test `https://your-render-service.onrender.com/api/health`.

---

## Step 3: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New → Project**.
2. Import your GitHub repository and configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add the **Environment Variable**:
   - `VITE_API_URL` = `https://your-render-service.onrender.com/api`
4. Click **Deploy**.
5. Add a `vercel.json` rewrite rule if needed so direct links like `/feed` or `/posts/123` resolve to `index.html`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## Step 4: Final Production CORS Sync

1. Copy your live Vercel domain (e.g., `https://njia-communityhub.vercel.app`).
2. Return to **Render → Environment** and set `CLIENT_URL` to your exact Vercel URL (no trailing slash). If supporting both preview and production domains, separate them with commas:
   ```text
   https://njia-communityhub.vercel.app,http://localhost:5173
   ```
3. Save changes so Render restarts with the updated CORS allowlist.

---

## Deployment Troubleshooting

- **CORS Error in Browser Console:** Ensure `CLIENT_URL` in Render matches the exact browser origin (`https://...`) with no trailing slash `/`.
- **Render Cold Start Delay:** Free Render instances spin down after 15 minutes of inactivity; the first request may take 30–50 seconds.
- **404 on Page Refresh on Vercel:** Add the `vercel.json` SPA rewrite configuration in `frontend/vercel.json` and redeploy.
- **MongoDB Connection Timeout:** Verify `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access and `<password>` is properly replaced in `MONGODB_URI`.
