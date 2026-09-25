# Product: Typeform Builder Clone

## What this is
An SDE Fullstack take-home assignment: a functional clone of Typeform. It must
replicate Typeform's design, UX, and core form-building/form-filling workflows.
The application should **visually and functionally feel like a modern Typeform**
— UI/UX similarity to the original is a graded criterion, not a nice-to-have.

The two hardest and most important pieces, per the assignment brief, are:
1. The form **builder** (drag-and-drop question editing + live preview).
2. The **respondent flow** — the polished, animated, one-question-at-a-time
   public form-fill experience.

AI tools (including Kiro) are explicitly allowed and encouraged, but every line
must be understandable and explainable by the author in an evaluation interview.
Prefer clear, conventional code over clever code for that reason.

## Core features (must have)

### 1. Form Builder
- Create a form with a title and an ordered list of questions.
- Add, edit, reorder (drag-and-drop), and delete questions.
- Question types: short text, long text, multiple choice, dropdown, email,
  number, yes/no, rating.
- Per-question settings: required toggle, description/help text.
- Live preview of the form as it's edited.

### 2. Form Management (CRUD)
- List of the creator's forms with status (draft/published) and response count.
- Create, rename, duplicate, delete forms.
- Publish / unpublish, generating a shareable public link.
- All form definitions persist (SQLite).

### 3. Respondent Flow (public, no login)
- One question at a time, full-screen, with smooth transitions.
- Keyboard navigation (Enter/arrow to advance) and a progress indicator.
- Client + server validation (required, email format, number, etc.).
- Submit stores the response; show a thank-you screen.

### 4. Results / Responses
- Per-form responses view (table/list of submissions).
- View an individual response in full.
- Basic summary stats per question (e.g. counts for choice questions).
- All responses persist.

### 5. Overall Typeform feel
- The conversational one-at-a-time fill UI with transitions.
- Clean builder layout with live preview.
- Forms, modals, inline editing, notifications/toasts.
- Settings placeholders (theme, thank-you screen).
- Goal: feel like Typeform, not a generic multi-field form.

## Explicitly mocked / placeholder (a "Coming Soon" panel is sufficient)
- Advanced logic jumps / branching (basic branching is a bonus, not required).
- Integrations / webhooks.
- Team collaboration & sharing.
- Payment / file-upload question types.
- Real creator authentication — assume a single default logged-in creator.

## Bonus (only after all of the above works)
- Logic jumps / conditional branching.
- Custom themes (colors, fonts, background).
- Export responses as CSV.
- Partial-response tracking / completion rate.
- File-upload question type.
- Dark mode.

## Deliverables
- Public GitHub repo with `frontend/` and `backend/`.
- README: setup instructions, architecture overview, database schema, API
  overview, assumptions made.
- A hosted, working demo link (Vercel/Netlify/Render/Railway or similar).
- Seed data: a couple of published forms with mixed question types and some
  existing responses, so the app is immediately usable.

## Evaluation criteria (in the order Kiro should prioritize effort)
1. Functionality — builder + one-question-at-a-time respondent flow working correctly.
2. UI/UX — visual similarity to Typeform.
3. Database design — well-structured schema, proper relationships.
4. Backend/API design — clean, sensible.
5. Code quality — clean, readable, organized.
6. Code modularity — separation of concerns, reusable components.
7. Code understanding — the author must be able to explain it, so keep it conventional.

## Code style requirement (applies to every prompt below)
The author has to walk through and explain every line of this codebase in a
live evaluation interview — that constraint is as important as any feature.
So, throughout:
- Prefer straightforward, conventional patterns over clever or terse ones.
  A slightly longer, obvious implementation beats a compact one that needs
  unpacking.
- Avoid unnecessary abstraction layers, generic factories, or indirection
  that isn't earning its keep for a project this size — one clear function
  beats a configurable framework for one use case.
- Add short comments on anything non-obvious (why, not just what): tricky
  state updates, validation logic, drag-and-drop reordering math, the
  slug-generation logic, transaction boundaries.
- Keep functions and components small and named for what they do, so the
  code is self-explanatory even before the comments.
- When a feature has a "simple version" and a "clever version" that both
  satisfy the requirement, take the simple version.