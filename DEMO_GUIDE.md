# Demo Guide - Typeform Clone

## Quick Start

### Servers Running
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3003

### Sample Data
The database has been seeded with:
- 2 published forms with multiple question types
- Sample responses to demonstrate the response management features

## Demo Flow (5 minutes)

### 1. Dashboard (30 seconds)
**URL**: http://localhost:3003/forms

**Show**:
- List of existing forms
- Status badges (Published/Draft)
- Response counts (clickable)
- Create new form button
- Form actions (Edit, Publish, Duplicate, Delete)

**Demo**:
1. Click on a form title to rename it inline
2. Click "Copy" on the shareable link
3. Click response count to see responses

### 2. Form Builder (2 minutes)
**URL**: http://localhost:3003/forms/1/edit

**Show**:
- 3-column layout (questions, editor, preview)
- Drag-and-drop reordering
- Add question menu (8 types)
- Live preview updates
- Autosave indicator

**Demo**:
1. **Drag to reorder**: Grab a question by the handle icon and drag
2. **Add a question**: Click "+ Add question" and select a type
3. **Edit question**: 
   - Change the title → watch preview update in real-time
   - Toggle "Required" → see asterisk appear in preview
   - For multiple choice: add/edit/delete options
   - For rating: change max stars
   - For number: set min/max bounds
4. **Delete a question**: Click trash icon, confirm

### 3. Respondent Flow (2 minutes)
**URL**: http://localhost:3003/f/keFtrRVzfow

**Show**:
- One question at a time, full screen
- Progress bar at top
- Smooth transitions
- All question types working
- Keyboard navigation

**Demo**:
1. **Fill out the form**:
   - Email question → type an email
   - Press Enter to advance
   - Rating question → click stars (auto-advances)
   - Multiple choice → select option (auto-advances)
   - Yes/No → click button (auto-advances)
   - Show required field validation (try to skip)
   - Show format validation (enter invalid email)
2. **Keyboard navigation**:
   - Use Enter to advance
   - Use ↑ arrow to go back
   - Use ↓ arrow to advance
3. **Submit** → see thank you screen

### 4. Response Management (30 seconds)
**URL**: http://localhost:3003/forms/1/responses

**Show**:
- Summary statistics per question
- Response list table
- Individual response details

**Demo**:
1. View summary stats at top (counts per option)
2. Click "View details →" on a response
3. See full response in modal

## Key Features to Highlight

### Technical Excellence
1. **Type Safety**: TypeScript throughout with proper types matching backend
2. **Validation**: Both client and server-side validation
3. **Real-time Updates**: Live preview, autosave with debouncing
4. **Smooth UX**: Framer Motion animations, keyboard shortcuts
5. **Clean Code**: Conventional patterns, well-commented, interview-ready

### Design Similarity to Typeform
1. **Conversational Flow**: One question at a time
2. **Clean Aesthetics**: Minimal design, generous whitespace
3. **Smooth Interactions**: Transitions, auto-advance on selections
4. **Professional Polish**: Progress indicator, save status, loading states

### Database Design
1. **Proper Schema**: Forms → Questions → Options, Responses → Answers
2. **Foreign Keys**: Cascade deletes work correctly
3. **Indexed Fields**: order_index for sorting
4. **JSON Fields**: Flexible settings_json for type-specific config

### API Design
1. **RESTful**: Proper HTTP verbs and status codes
2. **Validation**: Pydantic schemas throughout
3. **Documentation**: Auto-generated at /docs
4. **CORS**: Properly configured for frontend

## API Exploration

### Backend API Docs
**URL**: http://localhost:8000/docs

Shows all 17 endpoints with:
- Request/response schemas
- Try-it-out functionality
- Model definitions

### Sample API Calls

**Get a published form**:
```bash
curl http://localhost:8000/api/public/forms/keFtrRVzfow | python3 -m json.tool
```

**Submit a response**:
```bash
curl -X POST http://localhost:8000/api/public/forms/keFtrRVzfow/responses \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": 1, "value_text": "demo@example.com"},
      {"question_id": 2, "value_text": "5"}
    ]
  }'
```

**Get form responses**:
```bash
curl http://localhost:8000/api/forms/1/responses | python3 -m json.tool
```

**Get form statistics**:
```bash
curl http://localhost:8000/api/forms/1/stats | python3 -m json.tool
```

## All Question Types

The application supports 8 question types:

1. **Short Text** - Single line text input with underline
2. **Long Text** - Multi-line textarea
3. **Multiple Choice** - Radio buttons with auto-advance
4. **Dropdown** - Select menu
5. **Email** - Email input with regex validation
6. **Number** - Number input with min/max bounds
7. **Yes/No** - Large button pair with auto-advance
8. **Rating** - Star selector (3-10 stars) with auto-advance

Each type has:
- Appropriate input styling
- Type-specific validation
- Settings (where applicable)
- Live preview

## Code Organization

### Backend Structure
```
backend/
├── app/
│   ├── main.py           # FastAPI app setup
│   ├── db.py             # Database connection
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── seed.py           # Sample data
│   └── routers/
│       ├── forms.py      # Creator endpoints
│       ├── public.py     # Respondent endpoints
│       └── responses.py  # Response management
└── typeform.db           # SQLite database
```

### Frontend Structure
```
frontend/
├── app/
│   ├── (dashboard)/
│   │   └── forms/
│   │       ├── page.tsx              # Dashboard
│   │       └── [id]/
│   │           ├── edit/page.tsx     # Builder
│   │           └── responses/page.tsx # Responses
│   └── f/
│       └── [slug]/page.tsx           # Public form
├── components/
│   ├── FormCard.tsx                  # Form list item
│   ├── CreateFormModal.tsx           # Create modal
│   └── builder/
│       ├── QuestionListItem.tsx      # Draggable item
│       ├── AddQuestionMenu.tsx       # Type selector
│       ├── QuestionEditor.tsx        # Edit panel
│       └── QuestionPreview.tsx       # Live preview
└── lib/
    ├── types.ts                       # TypeScript types
    └── api.ts                         # API client
```

## Interview Talking Points

### Why Certain Decisions Were Made

1. **SQLite over PostgreSQL**: Faster to set up for take-home, easy to include database file in repo
2. **Sync over Async**: Simpler code, sufficient for take-home scope, easier to explain
3. **Tailwind CSS**: Rapid development, consistent design system, no CSS files to manage
4. **Next.js App Router**: Modern approach, good for SSR if needed later
5. **Autosave over Save Button**: Better UX, matches Typeform's pattern
6. **Client + Server Validation**: Client for UX, server for security

### Challenges Solved

1. **Drag and Drop**: Used @dnd-kit for accessible, touch-friendly reordering
2. **Live Preview**: Shared component between builder preview and public form
3. **Question Types**: Unified schema with settings_json for type-specific config
4. **Validation**: Pydantic + custom validation logic for format checks
5. **CORS**: Configured for multiple ports during development

### What Would Change for Production

1. Migrate to PostgreSQL
2. Add authentication (JWT tokens)
3. Implement response pagination
4. Add comprehensive test suite
5. Set up CI/CD
6. Add monitoring (Sentry, DataDog)
7. Implement rate limiting
8. Add caching layer (Redis)
9. Deploy to managed infrastructure
10. Add analytics tracking

## Success Criteria

### Functionality ✅
- [x] Form builder with drag-and-drop working
- [x] All 8 question types implemented
- [x] One-at-a-time respondent flow with transitions
- [x] Response management and stats
- [x] All CRUD operations working

### UI/UX ✅
- [x] Visual similarity to Typeform
- [x] Smooth animations and transitions
- [x] Keyboard navigation
- [x] Loading and error states
- [x] Responsive design

### Code Quality ✅
- [x] Clean, readable code
- [x] Conventional patterns
- [x] Good separation of concerns
- [x] Well-documented
- [x] Interview-ready (can explain every line)

## Troubleshooting

### If Backend Not Running
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### If Frontend Not Running
```bash
cd frontend
npm run dev -- -p 3003
```

### If Database Issues
```bash
cd backend
rm typeform.db  # Delete old database
python -m app.seed  # Re-seed data
```

### If CORS Issues
Check that `backend/app/main.py` has:
```python
allow_origins=["http://localhost:3000", "http://localhost:3003"]
```

## Next Steps

After the demo, consider implementing:
1. **CSV Export**: Download responses as spreadsheet
2. **Custom Themes**: Brand colors, fonts, backgrounds
3. **Logic Jumps**: Conditional question flow
4. **Partial Responses**: Save progress as user types
5. **Analytics**: Completion rate, time per question
6. **Dark Mode**: Theme toggle
7. **Webhooks**: Notify external systems on submission
8. **File Upload**: Add file upload question type
9. **Multi-language**: i18n support
10. **Team Collaboration**: Share forms between users

## Contact & Support

For questions about implementation details, refer to:
- `README.md` - Setup and architecture
- `TESTING.md` - Testing checklist
- `IMPLEMENTATION_COMPLETE.md` - Feature status
- Backend API docs - http://localhost:8000/docs
- Source documents - `product.md`, `tech.md`, `structure.md`

---

**Demo prepared by**: AI-assisted development with Kiro
**Time to complete**: ~14 conversational queries
**Lines of code**: ~3000 (backend: ~800, frontend: ~2200)
**Dependencies**: Minimal, well-maintained packages only
