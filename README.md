<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1c3e08RubrWzj2XNLuPg6_Gu5UnFnWVB2

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies: `npm install`
2. Copy [.env.local](.env.local) (or create it) and set the variables below.
3. Run the app: `npm run dev`

---

## Deploy to Vercel (start to finish)

Follow these steps in order. Your repo is **kenny153153/coolfood-app-cursor**.

---

### Step 0: Check the build locally (recommended)

In your project folder:

```bash
npm install
npm run build
```

If this finishes without errors, the same build will work on Vercel. You can ignore the "dist" folder; Vercel will create it during deploy.

---

### Step 1: Create the GitHub repository

1. Open **[github.com](https://github.com)** and sign in.
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** `coolfood-app-cursor`
4. Leave **Public** selected. Do **not** add a README, .gitignore, or license.
5. Click **Create repository**.

You’ll see a page saying “Quick setup — if you’ve done this kind of thing before”. Leave that open; you’ll use the repo URL in the next step.

---

### Step 2: Push your code to GitHub

Open a terminal and go to your project folder (the one that contains `package.json` and `vercel.json`).

**If this folder is not a git repo yet:**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/kenny153153/coolfood-app-cursor.git
git push -u origin main
```

**If it’s already a git repo** (you see a `.git` folder or have run `git init` before):

```bash
git add .
git commit -m "Ready for Vercel"
git branch -M main
git remote add origin https://github.com/kenny153153/coolfood-app-cursor.git
git push -u origin main
```

If `git remote add` says “remote origin already exists”, use:

```bash
git remote set-url origin https://github.com/kenny153153/coolfood-app-cursor.git
git push -u origin main
```

When the push succeeds, refresh the repo on GitHub; you should see your files.

---

### Step 3: Create the Vercel project and add env vars

1. Open **[vercel.com](https://vercel.com)** and sign in (choose **Continue with GitHub** if asked).
2. Click **Add New…** → **Project**.
3. Under **Import Git Repository**, find **kenny153153/coolfood-app-cursor** and click **Import** next to it.
   - If you don’t see it: click **Adjust GitHub App Permissions** and grant Vercel access to your account/repos, then try again.
4. On the **Configure Project** page:
   - **Framework Preset:** should show **Vite**. Don’t change it.
   - **Build Command:** leave default (`npm run build` or `vite build`).
   - **Output Directory:** leave default (`dist`).
   - **Root Directory:** leave blank.
5. **Environment Variables** (important — do this before deploying):
   - Click **Environment Variables**.
   - Add each row below. Name must match exactly; value is the same as in your `.env.local`.

| Name | Value (from your .env.local) |
|------|------------------------------|
| `GEMINI_API_KEY` | (paste your Gemini API key) |
| `NEXT_PUBLIC_SUPABASE_URL` | (paste your Supabase URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (paste your Supabase anon key) |
| `GOOGLE_MAPS_API_KEY` | (paste your Google Maps API key) |

   - Leave **Environment** as **Production** (or add to Production + Preview if you want).
6. Click **Deploy**.

---

### Step 4: Wait for the build and get your live URL

1. Vercel will run the build (usually 1–2 minutes). Watch the **Building** log.
2. If the build succeeds, you’ll see **Congratulations!** and a link like:
   - `https://coolfood-app-cursor-xxxx.vercel.app`  
   or  
   - `https://coolfood-app-cursor-kenny153153.vercel.app`
3. Click **Visit** (or open that URL). That is your **live site**.

If the build fails, open the failed deployment, read the error in the log (often a missing env var or a TypeScript/build error), fix it in your code, commit, push, and Vercel will redeploy.

---

### Step 5: Updating the site later

Whenever you change the code:

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

Vercel will automatically build and deploy. The same URL will show the new version after the deploy finishes.

---

### Summary

| Step | What you do |
|------|------------------|
| 0 | `npm run build` locally to verify. |
| 1 | Create empty repo `coolfood-app-cursor` on GitHub. |
| 2 | `git init`, add, commit, add remote, push to `main`. |
| 3 | Vercel → Add New → Project → Import repo → Add 4 env vars → Deploy. |
| 4 | Use the “Visit” URL as your live site. |
| 5 | Later: `git push origin main` to redeploy. |
