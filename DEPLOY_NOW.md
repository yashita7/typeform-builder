# 🚀 DEPLOY NOW - Quick Reference Card

**Time Required:** 15-20 minutes  
**Prerequisites:** GitHub account, committed code

---

## ⚡ RAPID DEPLOYMENT STEPS

### 1️⃣ Backend to Render (8 min)

1. **Go to:** https://render.com → Sign in with GitHub
2. **Click:** "New +" → "Web Service"
3. **Select:** `yashita7/typeform-builder` repo
4. **Render detects:** `render.yaml` ✓
5. **Set Environment Variable:**
   - Key: `CORS_ORIGINS`
   - Value: `https://temp-value.vercel.app` (you'll update this)
6. **Add Disk:**
   - Name: `typeform-data`
   - Mount: `/opt/render/project/data`
   - Size: 1GB
7. **Click:** "Create Web Service"
8. **Wait:** 3-5 minutes
9. **Copy URL:** `https://typeform-clone-api-xxxxx.onrender.com`

**Test:** Visit `{your-url}/docs` - should see API documentation

---

### 2️⃣ Frontend to Vercel (5 min)

1. **Go to:** https://vercel.com → Sign in with GitHub
2. **Click:** "Add New..." → "Project"
3. **Import:** `yashita7/typeform-builder`
4. **Configure:**
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
5. **Environment Variables:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://YOUR-RENDER-URL.onrender.com` (from step 1, no trailing slash)
6. **Click:** "Deploy"
7. **Wait:** 2-3 minutes
8. **Copy URL:** `https://typeform-builder-xxxxx.vercel.app`

**Test:** Visit URL - should see dashboard

---

### 3️⃣ Fix CORS (2 min)

1. **Go back to Render dashboard**
2. **Open your service** → "Environment" tab
3. **Edit `CORS_ORIGINS`:**
   - Old: `https://temp-value.vercel.app`
   - New: `https://YOUR-VERCEL-URL.vercel.app` (from step 2)
4. **Save** → Auto-redeploys in 30 seconds

---

### 4️⃣ Test Full Flow (5 min)

**Open Incognito Window:**

1. ✅ Go to Vercel URL → Dashboard loads with 2 forms
2. ✅ Create new form → Appears in list
3. ✅ Edit form → Add question → Shows in preview
4. ✅ Publish form → Get shareable link
5. ✅ **New incognito tab** → Paste link → Fill form
6. ✅ Back to dashboard → View responses → See answer

**Check console (F12):** No red errors

---

### 5️⃣ Update README (1 min)

**Edit `README.md` line 5:**

```markdown
**Live Demo**: https://YOUR-ACTUAL-VERCEL-URL.vercel.app
```

**Commit and push:**
```bash
git add README.md
git commit -m "Add live demo URL"
git push origin main
```

---

## 🎯 DONE!

Your Typeform clone is now live at:
- **Frontend:** `https://your-vercel-url.vercel.app`
- **Backend:** `https://your-render-url.onrender.com`
- **API Docs:** `https://your-render-url.onrender.com/docs`

---

## 🐛 Troubleshooting

### Issue: "CORS error" in browser console
**Fix:** Check `CORS_ORIGINS` on Render matches your exact Vercel URL (no trailing slash)

### Issue: "API endpoint not found"
**Fix:** Check `NEXT_PUBLIC_API_URL` in Vercel environment variables has correct Render URL

### Issue: Backend won't start
**Check Render logs:**
- Build logs: Did `pip install` succeed?
- Runtime logs: Does it say "Application startup complete"?

### Issue: Database not seeding
**Check Render logs for:** "Database already seeded" or seeding errors
**Fix:** Disk might not be mounted correctly - check mount path is `/opt/render/project/data`

### Issue: Forms don't save
**Fix:** Check disk is attached to service (Render dashboard → your service → Disk tab)

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **This Project:** See `DEPLOYMENT_GUIDE.md` for detailed walkthrough

---

## ✅ Post-Deployment Checklist

- [ ] Backend URL returns JSON at `/`
- [ ] Backend `/docs` shows API documentation
- [ ] Frontend loads dashboard in incognito
- [ ] Create form works
- [ ] Publish form works
- [ ] Fill form as respondent works (separate incognito)
- [ ] View responses works
- [ ] No console errors (F12)
- [ ] README updated with live URL
- [ ] CORS_ORIGINS matches Vercel URL exactly

**All checked?** You're deployment-ready for submission! 🎉
