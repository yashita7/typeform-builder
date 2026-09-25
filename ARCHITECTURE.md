# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Dashboard  │  │ Form Builder │  │ Respondent Flow  │  │
│  │             │  │              │  │                  │  │
│  │ /forms      │  │ /forms/1/    │  │ /f/slug          │  │
│  │             │  │ edit         │  │                  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                   │             │
│         └─────────────────┴───────────────────┘             │
│                           │                                 │
│                    Frontend (Next.js)                       │
│                    localhost:3003                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/JSON
                             │ CORS Enabled
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Backend (FastAPI)                        │
│                    localhost:8000                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Forms Router │  │Public Router │  │ Responses Router │ │
│  │              │  │              │  │                  │ │
│  │ /api/forms   │  │ /api/public  │  │ /api/forms/*/    │ │
│  │              │  │              │  │ responses        │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
│         │                 │                    │           │
│         └─────────────────┴────────────────────┘           │
│                           │                                │
│                    ┌──────▼────────┐                       │
│                    │  SQLAlchemy   │                       │
│                    │  ORM Layer    │                       │
│                    └──────┬────────┘                       │
└───────────────────────────┼────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   SQLite DB    │
                    │ typeform.db    │
                    └────────────────┘
```

## Data Flow Examples

### Creating a Form

```
User (Dashboard)
    │
    │ 1. Click "Create Form"
    │
    ▼
CreateFormModal
    │
    │ 2. POST /api/forms { title: "New Form" }
    │
    ▼
FastAPI (forms.py)
    │
    │ 3. Validate with Pydantic
    │ 4. Create Form model
    │ 5. Save to database
    │
    ▼
SQLite
    │
    │ 6. Return Form with ID
    │
    ▼
Dashboard
    │
    │ 7. Add to local state
    │ 8. Show toast notification
    │
    ▼
User sees new form in list
```

### Building a Form

```
User (Builder)
    │
    │ 1. Edit question title
    │
    ▼
QuestionEditor
    │
    │ 2. Update local state immediately
    │ 3. Debounce 500ms
    │
    ▼
API Call
    │
    │ 4. PATCH /api/forms/1/questions/5
    │    { title: "New title" }
    │
    ▼
FastAPI
    │
    │ 5. Validate with Pydantic
    │ 6. Update Question in DB
    │ 7. Return updated Question
    │
    ▼
QuestionEditor
    │
    │ 8. Update "saved" indicator
    │
    ▼
QuestionPreview
    │
    │ 9. Re-render with new title
    │
    ▼
User sees updated preview
```

### Filling a Form

```
User (Public Form)
    │
    │ 1. Open /f/keFtrRVzfow
    │
    ▼
PublicFormPage
    │
    │ 2. GET /api/public/forms/keFtrRVzfow
    │
    ▼
FastAPI (public.py)
    │
    │ 3. Verify form is published
    │ 4. Return form with questions
    │
    ▼
PublicFormPage
    │
    │ 5. Show first question
    │ 6. User answers and presses Enter
    │
    ▼
Validation
    │
    │ 7. Client-side validation
    │ 8. Store answer locally
    │ 9. Show next question
    │
    ▼
... (repeat for each question) ...
    │
    │ 10. On last question submit
    │
    ▼
API Call
    │
    │ 11. POST /api/public/forms/keFtrRVzfow/responses
    │     { answers: [...] }
    │
    ▼
FastAPI (public.py)
    │
    │ 12. Server-side validation
    │ 13. Create Response + Answers
    │ 14. Save in transaction
    │
    ▼
SQLite
    │
    │ 15. Return response ID
    │
    ▼
PublicFormPage
    │
    │ 16. Show thank-you screen
    │
    ▼
User sees completion message
```

## Database Schema

```
┌─────────────────────────┐
│        forms            │
├─────────────────────────┤
│ id                 (PK) │
│ title                   │
│ description             │
│ status                  │  draft | published
│ share_slug              │  unique, nullable
│ theme_json              │
│ created_at              │
│ updated_at              │
└─────────┬───────────────┘
          │
          │ 1:N
          │
┌─────────▼───────────────┐
│      questions          │
├─────────────────────────┤
│ id                 (PK) │
│ form_id            (FK) │  → forms.id
│ type                    │  short_text | long_text | ...
│ title                   │
│ description             │
│ required                │  boolean
│ order_index             │  int (for sorting)
│ settings_json           │  { max: 5, min: 0, ... }
└─────────┬───────────────┘
          │
          │ 1:N
          │
┌─────────▼───────────────┐
│   question_options      │
├─────────────────────────┤
│ id                 (PK) │
│ question_id        (FK) │  → questions.id
│ label                   │  "Option A"
│ order_index             │  int
└─────────────────────────┘


┌─────────────────────────┐
│        forms            │  (same as above)
└─────────┬───────────────┘
          │
          │ 1:N
          │
┌─────────▼───────────────┐
│      responses          │
├─────────────────────────┤
│ id                 (PK) │
│ form_id            (FK) │  → forms.id
│ submitted_at            │  timestamp
│ completed               │  boolean
│ started_at              │  timestamp (future)
└─────────┬───────────────┘
          │
          │ 1:N
          │
┌─────────▼───────────────┐
│       answers           │
├─────────────────────────┤
│ id                 (PK) │
│ response_id        (FK) │  → responses.id
│ question_id        (FK) │  → questions.id
│ value_text              │  "user answer"
│ value_json              │  future: array for multi-select
└─────────────────────────┘
```

## Component Hierarchy

### Dashboard
```
DashboardPage
│
├── CreateFormModal
│   └── form with title input
│
└── FormCard (for each form)
    ├── inline title editor
    ├── status badge
    ├── response count link
    ├── shareable link (if published)
    └── actions
        ├── Edit button → /forms/{id}/edit
        ├── Publish/Unpublish button
        ├── Duplicate button
        └── Delete button (with confirmation)
```

### Form Builder
```
FormBuilderPage
│
├── Header
│   ├── Back button
│   ├── Form title
│   └── Save indicator
│
└── 3-Column Layout
    │
    ├── Left: Question List
    │   ├── AddQuestionMenu
    │   │   └── dropdown with 8 types
    │   │
    │   └── DndContext (drag-and-drop)
    │       └── QuestionListItem (for each)
    │           ├── drag handle
    │           ├── question number
    │           ├── type badge
    │           ├── title preview
    │           └── delete button
    │
    ├── Center: Editor
    │   └── QuestionEditor
    │       ├── type badge
    │       ├── title input (autosave)
    │       ├── description textarea (autosave)
    │       ├── required toggle (immediate save)
    │       └── type-specific settings
    │           ├── options editor (choice/dropdown)
    │           ├── rating max selector
    │           └── number min/max inputs
    │
    └── Right: Preview
        └── QuestionPreview
            ├── question number
            ├── title display
            ├── description display
            └── input matching question type
```

### Respondent Flow
```
PublicFormPage
│
├── Progress Bar (animated)
│
├── Question Display (AnimatePresence)
│   │
│   ├── QuestionInput (dynamic by type)
│   │   ├── short_text → text input
│   │   ├── long_text → textarea
│   │   ├── multiple_choice → radio buttons
│   │   ├── dropdown → select menu
│   │   ├── email → email input
│   │   ├── number → number input
│   │   ├── yes_no → two buttons
│   │   └── rating → star selector
│   │
│   ├── error message (if validation fails)
│   │
│   └── action buttons
│       ├── Back button (if not first)
│       └── OK/Submit button
│
└── Thank You Screen (on completion)
```

### Response Management
```
FormResponsesPage
│
├── Header
│   ├── Back to dashboard
│   ├── Form title
│   ├── Response count
│   └── Edit form button
│
├── Summary Stats (grid)
│   └── StatCard (for each question)
│       ├── question title
│       ├── question type
│       └── aggregated data
│           ├── option counts (choice questions)
│           ├── value counts (rating)
│           └── total count (text)
│
├── Response List (table)
│   └── ResponseRow (for each)
│       ├── response ID
│       ├── submission timestamp
│       ├── status badge
│       └── view details button
│
└── Response Detail Modal
    ├── response info
    │   ├── ID and timestamp
    │   └── close button
    │
    └── Answer List
        └── AnswerDisplay (for each)
            ├── question title
            ├── question type
            └── answer value
```

## API Endpoint Map

### Creator Endpoints (Auth-free)
```
/api/forms
├── GET              → list all forms
├── POST             → create new form
│
└── /{id}
    ├── GET          → get form with questions
    ├── PATCH        → update form metadata
    ├── DELETE       → delete form (cascade)
    │
    ├── /duplicate
    │   └── POST     → duplicate form (deep copy)
    │
    ├── /publish
    │   └── POST     → publish (generate slug)
    │
    ├── /unpublish
    │   └── POST     → unpublish (set draft)
    │
    ├── /questions
    │   ├── POST     → add question
    │   │
    │   ├── /{qid}
    │   │   ├── PATCH    → update question
    │   │   └── DELETE   → delete question
    │   │
    │   └── /reorder
    │       └── PATCH    → batch reorder
    │
    └── /responses
        ├── GET      → list responses (paginated)
        │
        ├── /{rid}
        │   └── GET  → get response details
        │
        └── /stats
            └── GET  → get aggregated stats
```

### Public Endpoints (No Auth)
```
/api/public/forms
└── /{slug}
    ├── GET          → get published form
    │
    └── /responses
        └── POST     → submit response
```

## State Management

### Dashboard
```javascript
// Local React state
const [forms, setForms] = useState<FormListItem[]>([])
const [loading, setLoading] = useState(true)

// Operations
- loadForms() → GET /api/forms
- createForm() → POST /api/forms → add to forms
- updateForm() → PATCH /api/forms/{id} → update in forms
- deleteForm() → DELETE /api/forms/{id} → remove from forms
- publishForm() → POST /api/forms/{id}/publish → update in forms
```

### Form Builder
```javascript
// Local React state
const [form, setForm] = useState<Form | null>(null)
const [questions, setQuestions] = useState<Question[]>([])
const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
const [saving, setSaving] = useState(false)
const [lastSaved, setLastSaved] = useState<Date | null>(null)

// Operations
- loadForm() → GET /api/forms/{id}
- addQuestion() → POST /api/forms/{id}/questions → add to questions
- updateQuestion() → PATCH /api/forms/{id}/questions/{qid} → update in questions
- deleteQuestion() → DELETE /api/forms/{id}/questions/{qid} → remove from questions
- reorderQuestions() → PATCH /api/forms/{id}/questions/reorder → reorder questions
```

### Respondent Flow
```javascript
// Local React state
const [form, setForm] = useState<Form | null>(null)
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
const [answers, setAnswers] = useState<Answer[]>([])
const [currentValue, setCurrentValue] = useState("")
const [error, setError] = useState("")
const [completed, setCompleted] = useState(false)

// Operations
- loadForm() → GET /api/public/forms/{slug}
- handleNext() → validate, save locally, advance
- handlePrevious() → save locally, go back
- handleSubmit() → POST /api/public/forms/{slug}/responses
```

## Security Considerations

### Current (Take-Home Scope)
- ✅ CORS configured for specific origins
- ✅ Pydantic validation on all inputs
- ✅ SQL injection prevented (SQLAlchemy ORM)
- ✅ Published forms only accessible via public API
- ⚠️ No authentication (single default creator)
- ⚠️ No rate limiting
- ⚠️ No CSRF protection

### Production Additions Needed
- 🔒 JWT-based authentication
- 🔒 Rate limiting (per IP, per user)
- 🔒 CSRF tokens for mutations
- 🔒 Input sanitization (XSS prevention)
- 🔒 HTTPS enforcement
- 🔒 Database backups
- 🔒 Audit logs
- 🔒 API key for public form access

## Performance Optimizations

### Current
- ✅ Debounced autosave (500ms)
- ✅ Indexed database queries (order_index)
- ✅ Efficient React re-renders
- ✅ Minimal API calls

### Future Improvements
- 🚀 Add Redis caching layer
- 🚀 Implement pagination in UI
- 🚀 Add optimistic updates
- 🚀 Use SWR for data fetching
- 🚀 Add service worker for offline
- 🚀 Implement response streaming
- 🚀 Add CDN for static assets
- 🚀 Use connection pooling

## Deployment Architecture

### Development (Current)
```
localhost:3003 (Frontend)
       ↓
localhost:8000 (Backend)
       ↓
./typeform.db (SQLite)
```

### Production (Recommended)
```
vercel.app (Frontend - Static)
       ↓ HTTPS
render.com/railway.app (Backend - Container)
       ↓ SSL
PostgreSQL (Managed Database)
```

---

This architecture supports:
- ✅ Clear separation of concerns
- ✅ Scalable component structure
- ✅ Type-safe data flow
- ✅ Efficient state management
- ✅ Easy to extend and maintain
