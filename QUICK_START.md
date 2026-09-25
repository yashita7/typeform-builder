# Quick Start Guide

## 🚀 Start the Application

### Terminal 1 - Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 🔗 Important URLs

### Frontend
| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | http://localhost:3003/forms | List all forms, create/edit/delete |
| **Form Builder** | http://localhost:3003/forms/1/edit | Edit questions with live preview |
| **Responses** | http://localhost:3003/forms/1/responses | View submissions and stats |
| **Public Form** | http://localhost:3003/f/keFtrRVzfow | Fill out a form (respondent) |

### Backend
| Resource | URL | Description |
|----------|-----|-------------|
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/ | Basic status endpoint |

## 🎯 Quick Demo Path

1. **Dashboard** → View existing forms
2. **Create Form** → Click "+ Create form"
3. **Builder** → Click "Edit" on any form
4. **Add Questions** → Try all 8 question types
5. **Drag to Reorder** → Grab question by handle icon
6. **Live Preview** → Watch right panel update as you type
7. **Publish** → Click "Publish" from dashboard
8. **Copy Link** → Copy the shareable link
9. **Fill Form** → Open link in new tab
10. **View Responses** → Click response count from dashboard

## 📊 Sample Data

The database includes:
- **Form 1**: "Customer Feedback Survey" (slug: `keFtrRVzfow`)
- **Form 2**: "Tech Conference 2024 Registration" (slug: `ZDXNGKyffWw`)
- Multiple question types in each form
- Sample responses for testing

## ⌨️ Keyboard Shortcuts

### Respondent Flow
- `Enter` - Advance to next question
- `↑` - Go back to previous question
- `↓` - Advance to next question
- `Tab` - Navigate between form elements

### Builder
- Click and drag on handle icon to reorder questions
- Click title to rename inline
- `Enter` to save inline edits
- `Escape` to cancel inline edits

## 🧪 Test API Calls

### Get a Published Form
```bash
curl http://localhost:8000/api/public/forms/keFtrRVzfow
```

### Submit a Response
```bash
curl -X POST http://localhost:8000/api/public/forms/keFtrRVzfow/responses \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": 1, "value_text": "test@example.com"},
      {"question_id": 2, "value_text": "5"}
    ]
  }'
```

### Get All Forms
```bash
curl http://localhost:8000/api/forms
```

## 🎨 Question Types

1. **Short Text** - Single line input
2. **Long Text** - Multi-line textarea
3. **Multiple Choice** - Radio buttons
4. **Dropdown** - Select menu
5. **Email** - Validated email input
6. **Number** - Number with min/max
7. **Yes/No** - Binary choice buttons
8. **Rating** - Star rating (3-10 stars)

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3003
lsof -ti:3003 | xargs kill -9
```

### Database Reset
```bash
cd backend
rm typeform.db
python -c "from app.seed import seed; from app.db import engine; from app.models import Base; Base.metadata.create_all(engine); seed()"
```

### Clear Frontend Cache
```bash
cd frontend
rm -rf .next
npm run dev
```

## 📁 Key Files

### Backend
- `backend/app/main.py` - FastAPI app
- `backend/app/routers/forms.py` - Creator endpoints
- `backend/app/routers/public.py` - Respondent endpoints
- `backend/app/models.py` - Database models
- `backend/app/schemas.py` - Pydantic schemas

### Frontend
- `frontend/app/(dashboard)/forms/page.tsx` - Dashboard
- `frontend/app/(dashboard)/forms/[id]/edit/page.tsx` - Builder
- `frontend/app/f/[slug]/page.tsx` - Public form
- `frontend/lib/types.ts` - TypeScript types
- `frontend/lib/api.ts` - API client

## 📚 Documentation

- `README.md` - Full project documentation
- `DEMO_GUIDE.md` - Detailed demo walkthrough
- `TESTING.md` - Testing checklist
- `IMPLEMENTATION_COMPLETE.md` - Feature status
- `product.md` - Original requirements
- `structure.md` - Database and API structure
- `tech.md` - Technology stack

## ✅ Core Features

- ✅ Form CRUD (Create, Read, Update, Delete)
- ✅ Publish/Unpublish with unique slugs
- ✅ Drag-and-drop question reordering
- ✅ 8 question types fully supported
- ✅ Live preview in builder
- ✅ Autosave with status indicator
- ✅ One-question-at-a-time respondent flow
- ✅ Smooth transitions (Framer Motion)
- ✅ Keyboard navigation
- ✅ Client + server validation
- ✅ Response management with stats
- ✅ Typeform-inspired design

## 🚦 Status

- Backend: ✅ Running on http://localhost:8000
- Frontend: ✅ Running on http://localhost:3003
- Database: ✅ Seeded with sample data
- All Features: ✅ Complete and working

---

**Ready to demo!** 🎉

Open http://localhost:3003/forms to get started.
