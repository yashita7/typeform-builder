# Deployment Guide

Complete guide for deploying the Typeform Clone to production.

---

## 📋 Pre-Deployment Checklist

- [ ] Code is committed to GitHub repository
- [ ] All tests pass locally (`npm run build` in frontend)
- [ ] Sample data verified (2 published forms with responses)
- [ ] Environment variables documented

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

#### Option A: One-Click Deployment (Recommended)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will detect `render.yaml` and auto-configure

3. **Set environment variable**:
   - In Render dashboard, find your service
   - Go to "Environment" tab
   - Set `CORS_ORIGINS` to your Vercel URL (you'll get this in Step 2)
   - Example: `https://typeform-clone.vercel.app`

4. **Deploy**:
   - Click "Deploy" or wait for automatic deployment
   - Note your backend URL: `https://your-app.onrender.com`

#### Option B: Manual Setup

1. **Create Web Service**:
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repo

2. **Configure Build**:
   - **Name**: `typeform-clone-api`
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   DATABASE_PATH=/opt/render/project/data/typeform.db
   PYTHON_VERSION=3.11.0
   ```

4. **Add Persistent Disk** (optional but recommended):
   - Click "Add Disk"
   - Mount path: `/opt/render/project/data`
   - Size: 1 GB (free tier)
   - This ensures database persists across deploys

5. **Create and Deploy**

---

### Step 2: Deploy Frontend to Vercel

#### Deployment Steps

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://your-backend.onrender.com
     ```
   - Add to: Production, Preview, and Development

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Note your frontend URL: `https://your-project.vercel.app`

6. **Update Backend CORS**:
   - Go back to Render dashboard
   - Update `CORS_ORIGINS` with your Vercel URL
   - Example: `https://your-project.vercel.app`
   - Save and redeploy backend

---

### Step 3: Verify Deployment

1. **Test Backend Health**:
   ```bash
   curl https://your-backend.onrender.com/
   ```
   Should return:
   ```json
   {
     "message": "Typeform Clone API",
     "status": "running",
     "docs": "/docs"
   }
   ```

2. **Test API Endpoint**:
   ```bash
   curl https://your-backend.onrender.com/api/forms
   ```
   Should return array of forms

3. **Test Frontend**:
   - Visit `https://your-project.vercel.app`
   - Should see dashboard with 2 seed forms
   - Click "Edit" on a form → should load builder
   - Visit a published form link → should see respondent flow
   - Submit a response → should save successfully

4. **Test Full Flow**:
   - Create a new form
   - Add questions
   - Publish the form
   - Visit the share link
   - Fill out the form
   - View the response in dashboard

---

## 🔧 Troubleshooting

### Backend Issues

**Issue**: Backend returns 500 error
- **Check**: Render logs for Python errors
- **Fix**: Ensure all dependencies in `requirements.txt` are correct
- **Command**: Click on service → "Logs" tab

**Issue**: Database not persisting
- **Check**: Disk is properly mounted at `/opt/render/project/data`
- **Fix**: Add persistent disk in Render dashboard
- **Verify**: Check `DATABASE_PATH` env var is set correctly

**Issue**: CORS errors in browser
- **Check**: `CORS_ORIGINS` includes your Vercel URL
- **Fix**: Update env var and redeploy
- **Format**: Must be exact URL, e.g., `https://your-app.vercel.app`

### Frontend Issues

**Issue**: "Failed to fetch" errors
- **Check**: `NEXT_PUBLIC_API_URL` points to deployed backend
- **Fix**: Update env var in Vercel → redeploy
- **Verify**: Open Network tab in browser DevTools

**Issue**: Build fails
- **Check**: Build logs in Vercel dashboard
- **Common cause**: Missing dependencies in `package.json`
- **Fix**: Run `npm install` locally, commit, push

**Issue**: Environment variable not working
- **Check**: Variable name starts with `NEXT_PUBLIC_`
- **Fix**: Redeploy after adding env vars (they apply on next build)

---

## 📊 Monitoring

### Render Dashboard
- **Logs**: View real-time backend logs
- **Metrics**: CPU, memory, request count
- **Health**: Automatic health checks every 30 seconds

### Vercel Dashboard
- **Deployments**: View all deployments and their status
- **Analytics**: Page views, web vitals (on Pro plan)
- **Logs**: Function execution logs

---

## 🔄 Continuous Deployment

Both Render and Vercel are configured for automatic deployment:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Builds**:
   - Render: Deploys backend on every push to `main`
   - Vercel: Deploys frontend on every push to `main`

3. **Preview Deployments** (Vercel):
   - Every pull request gets a preview URL
   - Test changes before merging to main

---

## 🌍 Custom Domain (Optional)

### Vercel Custom Domain

1. Go to project Settings → Domains
2. Add your domain (e.g., `typeform.yourdomain.com`)
3. Follow DNS instructions (add CNAME record)
4. Vercel handles SSL automatically

### Render Custom Domain

1. Go to service Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Follow DNS instructions (add CNAME record)
4. Render provides free SSL certificate

### Update CORS After Domain Change

Don't forget to update `CORS_ORIGINS` on backend with your new custom domain!

---

## 💾 Database Management

### Backup Database (Render)

1. **Access Shell**:
   - Render dashboard → your service → "Shell" tab
   - Or use Render CLI

2. **Download Database**:
   ```bash
   # In Render shell
   cp /opt/render/project/data/typeform.db /tmp/backup.db
   
   # Download via Render dashboard → Files
   ```

3. **Restore Database**:
   ```bash
   # Upload via Render dashboard → Files
   # Or use Render CLI
   ```

### Migrate to PostgreSQL (Production)

For production scale, consider migrating to PostgreSQL:

1. **Add PostgreSQL service** in Render (free tier available)
2. **Update `backend/app/db.py`**:
   ```python
   DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./typeform.db")
   engine = create_engine(DATABASE_URL)
   ```
3. **Set env var** `DATABASE_URL` to your PostgreSQL connection string
4. **Redeploy**

---

## 📈 Scaling

### Free Tier Limits

**Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month (sufficient for 1 service)

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- No sleep/spin-down

### Upgrading

**Backend (Render)**:
- Upgrade to Starter ($7/month) for always-on service
- No spin-down, better performance
- More disk space and bandwidth

**Frontend (Vercel)**:
- Pro plan ($20/month/team) for:
  - Analytics
  - Password protection
  - More bandwidth
  - Team collaboration

---

## 🔐 Security Considerations

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Render/Vercel dashboards for secrets
- ✅ Rotate secrets regularly

### Database
- ✅ Use persistent disk on Render
- ✅ Regular backups (manual or automated)
- ✅ Consider PostgreSQL for production

### CORS
- ✅ Restrict `CORS_ORIGINS` to your domain only
- ✅ Don't use `*` (allow all origins)

### API Rate Limiting
- ⚠️ Current implementation has no rate limiting
- 🔧 Add rate limiting for production (e.g., `slowapi`)

---

## 📝 Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Can create a form
- [ ] Can add questions to form
- [ ] Can publish form
- [ ] Can fill out published form
- [ ] Responses are saved and viewable
- [ ] Stats/analytics work
- [ ] All question types work
- [ ] Validation works (client and server)
- [ ] CORS is properly configured
- [ ] Database persists across deploys (if using disk)
- [ ] Logs are accessible in dashboards
- [ ] Performance is acceptable

---

## 🎯 Production Recommendations

### Before Going Live

1. **Add Authentication**:
   - Implement JWT-based auth for creator routes
   - Use NextAuth.js or similar for frontend
   - Protect all `/api` endpoints except `/api/public`

2. **Add Rate Limiting**:
   - Install `slowapi` or similar
   - Limit public form submissions
   - Protect against abuse

3. **Improve Database**:
   - Migrate to PostgreSQL
   - Add connection pooling
   - Implement database migrations (Alembic)

4. **Add Monitoring**:
   - Sentry for error tracking
   - Google Analytics or Plausible
   - Uptime monitoring (UptimeRobot, etc.)

5. **Optimize Performance**:
   - Add Redis caching
   - Enable CDN (Vercel does this automatically)
   - Optimize images and assets

6. **Add Testing**:
   - Unit tests (pytest for backend, Jest for frontend)
   - Integration tests
   - E2E tests (Playwright or Cypress)

---

## 📞 Support

### Documentation
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org/docs

### Community
- Render: https://community.render.com
- Vercel: https://github.com/vercel/vercel/discussions

---

**Your Typeform Clone is now live! 🎉**

Share your deployed URL and start collecting responses!
