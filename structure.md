# Structure

## Repo layout
```
/
├── frontend/         # Next.js app
├── backend/          # FastAPI app
└── README.md         # setup, architecture, schema, API overview, assumptions
```

## Database schema
```
forms
  id (pk), title, description, status (draft|published),
  share_slug (unique, nullable until published), theme_json (nullable),
  created_at, updated_at

questions
  id (pk), form_id (fk->forms), type (short_text|long_text|multiple_choice|
  dropdown|email|number|yes_no|rating), title, description, required (bool),
  order_index (int), settings_json (e.g. rating max, number min/max)

question_options
  id (pk), question_id (fk->questions), label, order_index
  -- only used for multiple_choice / dropdown

responses
  id (pk), form_id (fk->forms), submitted_at, completed (bool),
  started_at (reserved for the partial-completion-tracking bonus)

answers
  id (pk), response_id (fk->responses), question_id (fk->questions),
  value_text (nullable), value_json (nullable — for multi-select later)
```

## API surface

### Creator-side (auth-free, single default user)
```
GET    /api/forms
POST   /api/forms
GET    /api/forms/{id}
PATCH  /api/forms/{id}
DELETE /api/forms/{id}
POST   /api/forms/{id}/duplicate
POST   /api/forms/{id}/publish
POST   /api/forms/{id}/unpublish

POST   /api/forms/{id}/questions
PATCH  /api/forms/{id}/questions/{qid}
DELETE /api/forms/{id}/questions/{qid}
PATCH  /api/forms/{id}/questions/reorder     # batch order_index update

GET    /api/forms/{id}/responses
GET    /api/forms/{id}/responses/{rid}
GET    /api/forms/{id}/stats
```

### Public (no auth — used by the respondent flow)
```
GET    /api/public/forms/{slug}
POST   /api/public/forms/{slug}/responses
```

## Conventions
- Questions and options are always returned ordered by `order_index`.
- Publishing a form generates a unique, URL-safe `share_slug`; the public API
  only ever exposes published forms.
- All mutation endpoints return the updated resource so the frontend can
  update state without a second fetch.
- Keep frontend components split by concern: `dashboard/`, `builder/`,
  `respondent/`, `results/` — mirrors the four core feature areas above.