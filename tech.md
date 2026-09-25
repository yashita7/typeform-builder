# Tech Stack

## Frontend — `frontend/`
- Next.js 14, App Router, TypeScript
- Tailwind CSS for styling
- Framer Motion — question-to-question transitions in the respondent flow
- `@dnd-kit/core` — drag-and-drop question reordering in the builder
- `react-hook-form` + `zod` — form state and validation (both builder forms
  and respondent-flow validation)
- A lightweight toast library (e.g. `sonner`) for notifications
- Fetches the backend via `NEXT_PUBLIC_API_URL`

## Backend — `backend/`
- FastAPI
- SQLAlchemy (sync session is fine — this is a take-home, not a
  high-concurrency service)
- Pydantic v2 schemas for request/response validation
- SQLite as the database file, created and seeded on startup
- CORS enabled for the frontend's origin

## Code style
See "Code style requirement" in product.md — conventional over clever,
commented where non-obvious, minimal abstraction. This overrides any
instinct to use advanced patterns (generic hooks, metaprogramming,
config-driven component factories) just because they're more "elegant" —
the author needs to explain every line in an interview.

## Explicitly not building
- No real authentication system — a single hardcoded "default creator" is
  used throughout. Do not add login/signup flows.
- No payment or file-upload handling (placeholder UI only).
- No microservices / message queues — a single FastAPI app is sufficient.

## Commands (fill in once scaffolded)
```
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

## Deployment targets
- Frontend → Vercel
- Backend → Render or Railway (needs a `Procfile` or start command, and the
  production CORS origin set via env var)