# Deployment Guide - Step by Step

**Target:** Deploy backend to Render, frontend to Vercel  
**Time Estimate:** 15-20 minutes  
**Status:** Ready to deploy

---

## 📋 Pre-Deployment Checklist

✅ render.yaml exists and configured  
✅ CORS configured to use environment variable  
✅ Database persistence configured (disk mount)  
✅ Frontend .env.example documented  
✅ All code committed to GitHub  

---

## 🔧 STEP 1: Deploy Backend to Render (10 minutes)

### 1.1 Sign Up / Log In to Render
1. Go to https://render.com
2. Sign up or log in (use GitHub for easy repo access)

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `yashita7/typeform-builder`
3. Render will detect the `render.yaml` file

### 1.3 Configure the Service
Render should auto-fill from `render.yaml`, but verify:

**Basic Settings:**
- **Name:** `typeform-clone-api` (or your choice)
- **Region:** Oregon (or closest to you)
- **Branch:** `main`
- **Root Directory:** Leave blank (render.yaml has `cd backend` in commands)
- **Runtime:** Python 3
- **Build Command:** `cd backend && pip install -r requirements.txt`
- **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
Click "Environment" tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `CORS_ORIGINS` | `https://your-app.vercel.app` | **IMPORTANT:** You'll update this after Vercel deployment |
| `DATABASE_PATH` | `/opt/render/project/data/typeform.db` | Already set |
| `PYTHON_VERSION` | `3.11.0` | Already set |

**For now, set CORS_ORIGINS to:** `https://typeform-clone.vercel.app` (you'll update this)

**Disk (Persistent Storage):**
1. Scroll to **"Disk"** section
2. Click **"Add Disk"**
3. **Name:** `typeform-data`
4. **Mount Path:** `/opt/render/project/data`
5. **Size:** 1 GB (free tier)

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll see build logs in real-time

### 1.5 Get Your Backend URL
Once deployed, Render gives you a URL like:
```
https://typeform-clone-api.onrender.com
```

**Test it immediately:**
```bash
curl https://your-backend-url.onrender.com/
# Should return: {"message":"Typeform Clone API","status":"running","docs":"/docs"}
```

### 1.6 Check Database Seeding
Visit: `https://your-backend-url.onrender.com/docs`
- Try GET `/api/forms` - should return 2 pre-seeded forms
- If empty, check logs for seeding errors

**🎯 Checkpoint:** Backend URL responding with API docs

---

## 🎨 STEP 2: Deploy Frontend to Vercel (5 minutes)

### 2.1 Sign Up / Log In to Vercel
1. Go to https://vercel.com
2. Sign up or log in (use GitHub for easy repo access)

### 2.2 Create New Project
1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository:** Select `yashita7/typeform-builder`
3. Click **"Import"**

### 2.3 Configure the Project
**Framework Preset:** Next.js (auto-detected)

**Root Directory:**
- Click **"Edit"**
- Set to: `frontend`
- Click **"Continue"**

**Build Settings (auto-filled):**
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

**Environment Variables:**
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` |

**Paste your actual Render backend URL here!**

Example: `https://typeform-clone-api.onrender.com` (no trailing slash)

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. Watch build logs for any errors

### 2.5 Get Your Frontend URL
Vercel gives you a URL like:
```
https://typeform-builder-yashita7.vercel.app
```

Or custom domain if you set one up.

**🎯 Checkpoint:** Frontend URL loads in browser

---

## 🔄 STEP 3: Update CORS on Backend (Critical!)

Now that you have the Vercel URL, update the backend CORS:

### 3.1 Go to Render Dashboard
1. Open your backend service
2. Go to **"Environment"** tab
3. Find **`CORS_ORIGINS`** variable

### 3.2 Update Value
Change from temporary value to your actual Vercel URL:

**Old:** `https://typeform-clone.vercel.app`  
**New:** `https://typeform-builder-yashita7.vercel.app` (your actual URL)

**Important:** No trailing slash!

### 3.3 Redeploy
1. Click **"Save Changes"**
2. Render will automatically redeploy (30 seconds)

**🎯 Checkpoint:** CORS updated with correct origin

---

## ✅ STEP 4: End-to-End Test (5 minutes)

### 4.1 Test in Incognito Window
**Why incognito?** Ensures you're testing the deployed version, not cached localhost.

1. Open **new incognito/private window**
2. Go to your Vercel URL: `https://your-app.vercel.app`

### 4.2 Verify Dashboard Loads
✅ Dashboard page loads  
✅ 2 pre-seeded forms appear  
✅ No console errors (press F12 to check)

### 4.3 Full Flow Test - CREATE FORM
1. Click **"+ Create form"**
2. Enter title: "Deployment Test Form"
3. Click **"Create"**
4. ✅ Form appears in list

### 4.4 Full Flow Test - BUILD FORM
1. Click **"Edit"** on the new form
2. Builder loads (3-column layout)
3. Click **"+ Add Question"** → Multiple Choice
4. Add question: "What's your favorite color?"
5. Add options: Red, Blue, Green
6. ✅ Question appears in preview panel
7. ✅ "Saved" indicator shows

### 4.5 Full Flow Test - PUBLISH
1. From builder, go back to dashboard (or use breadcrumb)
2. Find your form
3. Click **"Publish"** button
4. ✅ Status changes to "Published"
5. ✅ Shareable link appears
6. Copy the link

### 4.6 Full Flow Test - FILL OUT (RESPONDENT)
1. **Open a second incognito window** (important - simulates real user)
2. Paste the shareable link (e.g., `/f/abc123xyz`)
3. ✅ Respondent flow loads with question
4. ✅ Progress bar visible
5. Select an answer (e.g., "Blue")
6. Click **"OK"** (or press Enter)
7. ✅ Thank you screen appears

### 4.7 Full Flow Test - VIEW RESPONSES
1. Go back to first incognito window (dashboard)
2. Click on form → **"Responses"** link (or responses count)
3. ✅ Response appears with submitted answer
4. ✅ Stats show distribution (Blue: 1)

### 4.8 Check Console
Press **F12** in browser:
- ✅ No red errors in Console tab
- ✅ API calls to Render backend succeed (Network tab)

**🎯 Checkpoint:** Full flow works end-to-end on deployed version

---

## 📝 STEP 5: Update README

### 5.1 Edit README.md
<function_calls>
<invoke name="str_replace">
<parameter name="path">/Users/yashita/personal/Projects/Typeform project/README.md