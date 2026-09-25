# Typeform Clone

A full-stack Typeform clone built with Next.js and FastAPI, featuring a drag-and-drop form builder, conversational one-question-at-a-time respondent flow, and response analytics.

**Live Demo**: [Coming Soon]

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Overview](#api-overview)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Assumptions](#assumptions)
- [Project Structure](#project-structure)

---

## ✨ Features

### Form Builder
- **Drag-and-drop question reordering** with smooth animations
- **8 question types**: Short text, Long text, Multiple choice, Dropdown, Email, Number, Yes/No, Rating
- **Per-question settings**: Required toggle, description, type-specific options
- **Live preview** panel showing how respondents will see each question
- **Auto-save** with visual save status indicator
- **Publish/unpublish** workflow with shareable links

### Respondent Flow
- **One-question-at-a-time** full-screen experience with Typeform's signature large titles
- **Smooth transitions** between questions using Framer Motion
- **Keyboard navigation**: Enter to advance, arrow keys to navigate
- **Progress indicator** showing completion status
- **Client + server validation** for all question types
- **Auto-advance** for quick questions (multiple choice, yes/no, rating)
- **Thank-you screen** with animations

### Dashboard & Analytics
- **Form management**: Create, rename, duplicate, delete forms
- **Response viewing**: Individual responses and aggregate stats
- **Distribution charts** for multiple choice and dropdown questions
- **Response counts** and completion tracking

### UI/UX Polish
- **Typeform-inspired design** with generous whitespace and clean typography
- **Smooth animations** throughout (200ms micro, 300ms modals)
- **Consistent hover/focus states** on all interactive elements
- **Loading and empty states** for every data fetch
- **Responsive design** for all screen sizes
- **Accessible** with proper focus states and keyboard navigation

---

## 🛠 Tech Stack

### Frontend (`frontend/`)
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for smooth question transitions
- **@dnd-kit/core** for drag-and-drop reordering
- **react-hook-form + zod** for form validation
- **Sonner** for toast notifications

### Backend (`backend/`)
- **FastAPI** for API framework
- **SQLAlchemy** (sync) for ORM
- **Pydantic v2** for request/response validation
- **SQLite** for database (with foreign key constraints)
- **Uvicorn** as ASGI server

### Deployment Targets
- **Frontend**: Vercel
- **Backend**: Render or Railway

---

## 🏗 Architecture Overview

### System Architecture

```
┌─────────────┐         HTTP/JSON          ┌─────────────┐
│             │ ◄────────────────────────► │             │
│  Next.js    │         REST API           │   FastAPI   │
│  Frontend   │    (CORS enabled)          │   Backend   │
│             │                            │             │
└─────────────┘                            └──────┬──────┘
      │                                           │
      │                                           │
      ▼                                           ▼
┌─────────────┐                            ┌─────────────┐
│   Browser   │                            │   SQLite    │
│   Storage   │                            │  Database   │
└─────────────┘                            └─────────────┘
```

### Communication Flow

1. **Frontend ↔ Backend Communication**:
   - Frontend makes HTTP requests to backend API
   - API base URL configured via `NEXT_PUBLIC_API_URL` environment variable
   - All requests include `Content-Type: application/json` header
   - CORS enabled on backend to allow cross-origin requests

2. **Request Flow**:
   ```
   User Action → React Component → API Utility (lib/api.ts)
   → Fetch Request → FastAPI Route → SQLAlchemy ORM
   → SQLite Database → Response → JSON → React State → UI Update
   ```

3. **Data Flow Examples**:
   - **Creating a form**: `POST /api/forms` → Creates form record → Returns form with ID
   - **Adding a question**: `POST /api/forms/{id}/questions` → Creates question and options → Returns full question object
   - **Publishing a form**: `POST /api/forms/{id}/publish` → Generates unique slug → Updates status
   - **Submitting a response**: `POST /api/public/forms/{slug}/responses` → Validates all answers → Creates response and answer records

4. **Public vs. Authenticated Routes**:
   - **Creator routes** (`/api/*`): No authentication (assumes single default creator)
   - **Public routes** (`/api/public/*`): Accessible to anyone with the form slug
   - Production would add JWT authentication for creator routes

---

## 🗄 Database Schema

The database uses SQLite with foreign key constraints enabled. All relationships use CASCADE DELETE for automatic cleanup.

### Entity Relationship Diagram

```
┌──────────┐         ┌──────────────┐         ┌────────────────────┐
│  forms   │────────<│  questions   │────────<│  question_options  │
└────┬─────┘         └──────┬───────┘         └────────────────────┘
     │                      │
     │                      │
     │                      │
     v                      v
┌──────────┐         ┌──────────┐
│responses │────────<│ answers  │
└──────────┘         └──────────┘
```

### Tables

#### `forms`
Stores form definitions created by the creator.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `title` | VARCHAR(255) | Form title (required) |
| `description` | TEXT | Optional form description |
| `status` | VARCHAR(20) | `draft` or `published` |
| `share_slug` | VARCHAR(50) | Unique URL-safe slug for published forms |
| `theme_json` | JSON | Reserved for future theme customization |
| `created_at` | DATETIME | Creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

**Rationale**: Central entity for form management. The `share_slug` is generated only when publishing to ensure uniqueness. The `status` field enables draft/published workflow. `theme_json` is a placeholder for future customization features.

#### `questions`
Stores questions belonging to forms.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `form_id` | INTEGER (FK) | References `forms.id` (CASCADE DELETE) |
| `type` | VARCHAR(50) | Question type (enum-like) |
| `title` | TEXT | Question text (required) |
| `description` | TEXT | Optional help text |
| `required` | BOOLEAN | Whether answer is required |
| `order_index` | INTEGER | Display order (0-based) |
| `settings_json` | JSON | Type-specific settings (e.g., rating max, number min/max) |

**Rationale**: Questions are tightly coupled to forms (CASCADE DELETE ensures cleanup). The `order_index` allows arbitrary reordering without renumbering. `settings_json` provides flexibility for type-specific configuration without adding columns per type. The `type` field uses string values for simplicity over enums.

**Supported types**: `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`

#### `question_options`
Stores options for multiple choice and dropdown questions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `question_id` | INTEGER (FK) | References `questions.id` (CASCADE DELETE) |
| `label` | VARCHAR(255) | Option text |
| `order_index` | INTEGER | Display order (0-based) |

**Rationale**: Separate table for options allows unlimited choices and maintains clean question schema. Only used for `multiple_choice` and `dropdown` types. CASCADE DELETE automatically removes options when parent question is deleted.

#### `responses`
Stores form submissions from respondents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `form_id` | INTEGER (FK) | References `forms.id` (CASCADE DELETE) |
| `submitted_at` | DATETIME | Submission timestamp |
| `completed` | BOOLEAN | Whether all required questions were answered |
| `started_at` | DATETIME | Reserved for partial-completion tracking |

**Rationale**: Responses are form-specific (CASCADE DELETE for cleanup). The `completed` flag distinguishes full submissions from partial saves (future feature). `submitted_at` is indexed for sorting recent responses.

#### `answers`
Stores individual question answers within a response.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `response_id` | INTEGER (FK) | References `responses.id` (CASCADE DELETE) |
| `question_id` | INTEGER (FK) | References `questions.id` |
| `value_text` | TEXT | Answer value as text |
| `value_json` | JSON | Reserved for complex answers (e.g., multi-select) |

**Rationale**: Answers link responses to questions, forming a many-to-many relationship. `value_text` stores all current answer types as strings (numbers and ratings are stored as strings then parsed). `value_json` is reserved for future multi-select support. Both foreign keys use CASCADE DELETE for automatic cleanup.

### Foreign Key Relationships

All foreign keys use `ON DELETE CASCADE` to ensure referential integrity:
- Deleting a form → deletes all its questions, responses, and answers
- Deleting a question → deletes all its options and related answers
- Deleting a response → deletes all its answers

### Indexes

- `forms.share_slug`: Unique index for fast public form lookup
- `forms.status`: Index for filtering published/draft forms
- `questions.form_id, questions.order_index`: Composite index for ordered question retrieval
- `responses.form_id, responses.submitted_at`: Composite index for response listing

---

## 📡 API Overview

All creator-side endpoints are under `/api`, public endpoints under `/api/public`.

### Creator Endpoints (Form Management)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **Forms** |
| `GET` | `/api/forms` | List all forms | - | `Form[]` |
| `POST` | `/api/forms` | Create a form | `{ title }` | `Form` |
| `GET` | `/api/forms/{id}` | Get form with questions | - | `Form` (includes questions) |
| `PATCH` | `/api/forms/{id}` | Update form metadata | `{ title?, description? }` | `Form` |
| `DELETE` | `/api/forms/{id}` | Delete form | - | `{ message }` |
| `POST` | `/api/forms/{id}/duplicate` | Duplicate form | - | `Form` |
| `POST` | `/api/forms/{id}/publish` | Publish form (generate slug) | - | `Form` |
| `POST` | `/api/forms/{id}/unpublish` | Unpublish form (clear slug) | - | `Form` |
| **Questions** |
| `POST` | `/api/forms/{id}/questions` | Add question to form | `QuestionCreate` | `Question` |
| `PATCH` | `/api/forms/{fid}/questions/{qid}` | Update question | `QuestionUpdate` | `Question` |
| `DELETE` | `/api/forms/{fid}/questions/{qid}` | Delete question | - | `{ message }` |
| `PATCH` | `/api/forms/{id}/questions/reorder` | Reorder questions | `{ question_ids: [1,3,2] }` | `{ message }` |
| **Responses** |
| `GET` | `/api/forms/{id}/responses` | List responses for form | - | `Response[]` |
| `GET` | `/api/forms/{fid}/responses/{rid}` | Get response details | - | `Response` (includes answers) |
| `GET` | `/api/forms/{id}/stats` | Get response statistics | - | `{ question_stats: [...] }` |

### Public Endpoints (Respondent Flow)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/public/forms/{slug}` | Get published form | - | `Form` (includes questions) |
| `POST` | `/api/public/forms/{slug}/responses` | Submit response | `{ answers: [...] }` | `Response` |

### Response Schemas

**Form**:
```json
{
  "id": 1,
  "title": "Customer Feedback",
  "description": "Help us improve",
  "status": "published",
  "share_slug": "abc123xy",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "questions": [...],
  "response_count": 5
}
```

**Question**:
```json
{
  "id": 1,
  "form_id": 1,
  "type": "multiple_choice",
  "title": "How did you hear about us?",
  "description": "Select one option",
  "required": true,
  "order_index": 0,
  "settings_json": null,
  "options": [
    { "id": 1, "question_id": 1, "label": "Social Media", "order_index": 0 },
    { "id": 2, "question_id": 1, "label": "Friend", "order_index": 1 }
  ]
}
```

**Answer Submission**:
```json
{
  "answers": [
    { "question_id": 1, "value_text": "5" },
    { "question_id": 2, "value_text": "alice@example.com" }
  ]
}
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ and pip
- **Git**

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables** (optional):
   
   Create a `.env` file in `backend/` (or set environment variables):
   ```bash
   # Optional: CORS origins for production (comma-separated)
   # CORS_ORIGINS=https://your-app.vercel.app
   
   # Optional: Database file path (defaults to ./typeform.db)
   # DATABASE_PATH=/path/to/typeform.db
   ```

5. **Run the backend**:
   ```bash
   uvicorn app.main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/`

6. **Database initialization**:
   
   The database is automatically created and seeded with sample data on first startup:
   - 2 published forms with mixed question types
   - 3-4 responses per form
   - Sample data includes all 8 question types

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment variables**:
   
   Create a `.env.local` file in `frontend/`:
   ```bash
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000` (or next available port)

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

### Verify Setup

1. Open the frontend URL in your browser
2. You should see the dashboard with 2 pre-seeded forms:
   - "Customer Feedback Survey" (5 questions, 3 responses)
   - "Tech Conference 2024 Registration" (5 questions, 4 responses)
3. Click "Edit" to see the form builder
4. Click on a published form's share link to test the respondent flow
5. View responses to see the analytics

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your repository
   - **Root directory**: `frontend`
   - **Framework preset**: Next.js
   - **Build command**: `npm run build` (auto-detected)
   - **Output directory**: `.next` (auto-detected)

3. **Environment variables**:
   Set in Vercel dashboard under Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**: Vercel will auto-deploy on every push to main

### Backend Deployment (Render)

1. **Create `render.yaml`** (optional, in project root):
   ```yaml
   services:
     - type: web
       name: typeform-clone-backend
       env: python
       buildCommand: "cd backend && pip install -r requirements.txt"
       startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
       envVars:
         - key: CORS_ORIGINS
           value: https://your-app.vercel.app
         - key: DATABASE_PATH
           value: /opt/render/project/data/typeform.db
   ```

2. **Deploy to Render**:
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Root directory**: `backend`
   - **Build command**: `pip install -r requirements.txt`
   - **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment variables**:
   Set in Render dashboard:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   DATABASE_PATH=/opt/render/project/data/typeform.db
   ```

4. **Persistent disk** (optional):
   - Add a disk mount at `/opt/render/project/data` to persist SQLite database
   - Or use PostgreSQL for production (requires code changes)

### Backend Deployment (Railway - Alternative)

1. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will detect the `Procfile` automatically

2. **Environment variables**:
   Set in Railway dashboard:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   DATABASE_PATH=/app/data/typeform.db
   ```

3. **Volume** (optional):
   - Add a volume mounted at `/app/data` to persist the database

### Post-Deployment

1. **Test the deployed backend**:
   ```bash
   curl https://your-backend-url.onrender.com/
   ```

2. **Update frontend env**: Make sure `NEXT_PUBLIC_API_URL` points to your deployed backend

3. **Test the full flow**:
   - Visit your Vercel URL
   - Create a form, publish it, and fill it out
   - Verify responses are saved

---

## 📝 Assumptions

This project was built with the following assumptions per the assignment requirements:

### Authentication
- **No real authentication system**: There is no login/signup flow
- **Single default creator**: All forms belong to a single implicit "default creator"
- **Public forms are open**: Anyone with the share link can fill out a published form
- **Production consideration**: In a real application, would add JWT-based authentication for creator routes and multi-tenancy support

### Database
- **SQLite for simplicity**: Suitable for development and small deployments
- **File-based storage**: Database is a single `typeform.db` file
- **Foreign key constraints enabled**: Ensures referential integrity and CASCADE DELETE
- **Production consideration**: PostgreSQL or MySQL would be more suitable for production scale

### Features Mocked/Placeholder
The following features have "Coming Soon" placeholders in the UI per product requirements:

1. **Logic jumps / conditional branching**: UI shows "Coming Soon" panels in builder Logic tab
2. **Integrations / webhooks**: Placeholder in form settings
3. **Team collaboration & sharing**: Placeholder in form settings
4. **Payment / file upload question types**: Listed in "Coming Soon" section of Add Question menu
5. **Theme customization**: Placeholder in form settings (colors, fonts, backgrounds)
6. **Thank-you screen customization**: Placeholder in form settings (redirect, social sharing)

### Data & Validation
- **Text-based storage**: All answer values stored as text (numbers/ratings converted)
- **Client + server validation**: Both frontend and backend validate inputs
- **Basic email validation**: Uses regex pattern, not SMTP verification
- **No rate limiting**: Would add rate limiting for production API
- **No spam protection**: Would add CAPTCHA for public form submissions

### Deployment
- **Environment-based config**: Uses environment variables for API URL, CORS origins, database path
- **Single-region deployment**: No CDN or multi-region setup
- **No CI/CD pipeline**: Would add automated testing and deployment in production

### Scalability
- **Synchronous SQLAlchemy**: Suitable for this take-home scope
- **No caching layer**: Would add Redis for production
- **No background jobs**: Would use Celery for email notifications, export generation, etc.
- **No pagination on frontend**: Would add virtual scrolling for large form lists

---

## 📁 Project Structure

```
.
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app with CORS
│   │   ├── db.py                # Database config and session
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── seed.py              # Database seeding script
│   │   └── routers/             # API route handlers
│   │       ├── forms.py         # Form + Question CRUD
│   │       ├── responses.py     # Response viewing and stats
│   │       └── public.py        # Public form + submission
│   ├── requirements.txt         # Python dependencies
│   ├── Procfile                 # For Render/Railway deployment
│   └── typeform.db             # SQLite database (created on first run)
│
├── frontend/                     # Next.js frontend
│   ├── app/                     # Next.js App Router pages
│   │   ├── (dashboard)/         # Dashboard layout group
│   │   │   ├── forms/           # Forms list and CRUD
│   │   │   │   └── [id]/        # Dynamic form routes
│   │   │   │       ├── edit/    # Form builder
│   │   │   │       ├── responses/  # Response viewing
│   │   │   │       └── settings/   # Form settings
│   │   │   └── layout.tsx       # Dashboard layout with nav
│   │   ├── f/[slug]/            # Public form-fill page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles + animations
│   ├── components/              # React components
│   │   ├── builder/             # Form builder components
│   │   │   ├── AddQuestionMenu.tsx
│   │   │   ├── QuestionEditor.tsx
│   │   │   ├── QuestionListItem.tsx
│   │   │   ├── QuestionPreview.tsx
│   │   │   └── LogicTab.tsx
│   │   ├── FormCard.tsx         # Dashboard form card
│   │   ├── CreateFormModal.tsx  # Create form dialog
│   │   └── ComingSoonPanel.tsx  # Placeholder for mocked features
│   ├── lib/                     # Utilities
│   │   ├── api.ts               # API client wrapper
│   │   └── types.ts             # TypeScript types
│   ├── .env.local               # Environment variables (create this)
│   ├── package.json
│   └── tailwind.config.ts       # Tailwind CSS config
│
├── README.md                     # This file
├── product.md                    # Product requirements
├── tech.md                       # Technical specifications
└── structure.md                  # Database and API structure
```

---

## 📚 Additional Documentation

- **Product Requirements**: See `product.md` for detailed feature requirements
- **Tech Stack Details**: See `tech.md` for technology decisions
- **Database & API Structure**: See `structure.md` for detailed schema and API documentation
- **Visual Polish**: See `VISUAL_POLISH_COMPLETE.md` for UI/UX enhancements
- **Testing Guide**: See `VISUAL_POLISH_TEST_GUIDE.md` for comprehensive testing checklist

---

## 🎯 Assignment Requirements Checklist

### Core Features ✅
- [x] Form Builder with drag-and-drop reordering
- [x] 8 question types with per-question settings
- [x] Live preview panel
- [x] Form CRUD operations (create, rename, duplicate, delete)
- [x] Publish/unpublish with shareable links
- [x] One-question-at-a-time respondent flow
- [x] Keyboard navigation (Enter, arrows)
- [x] Client + server validation
- [x] Response viewing and basic stats
- [x] All data persists in SQLite

### UI/UX ✅
- [x] Typeform-inspired design
- [x] Smooth transitions and animations
- [x] Conversational form-fill experience
- [x] Clean builder layout
- [x] Mobile responsive

### Technical ✅
- [x] Next.js 14 App Router with TypeScript
- [x] FastAPI backend with Pydantic validation
- [x] SQLite with foreign key constraints
- [x] CORS enabled
- [x] Proper database schema with relationships
- [x] RESTful API design

### Deliverables ✅
- [x] Public GitHub repository
- [x] README with setup instructions
- [x] Architecture overview
- [x] Database schema documentation
- [x] API overview
- [x] Assumptions documented
- [x] Sample data (2 published forms with responses)
- [x] Deployment configuration (Vercel + Render/Railway)

### Code Quality ✅
- [x] Clean, readable code
- [x] Comments on non-obvious logic
- [x] Modular component structure
- [x] Separation of concerns
- [x] Conventional patterns (explainable in interview)

---

## 📄 License

This project was created as a take-home assignment. All rights reserved.

---

## 🤝 Contact

For questions about this implementation, please refer to the codebase comments and documentation.

**Built with ❤️ using Next.js and FastAPI**
