# Backend API Documentation

FastAPI backend for the Typeform Clone application.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Server

```bash
uvicorn app.main:app --reload
```

Server runs on: http://localhost:8000  
API Documentation: http://localhost:8000/docs

## Database

SQLite database (`typeform.db`) is automatically created and seeded on first startup with:
- 2 published forms with mixed question types
- Sample responses for each form

## API Overview

### Forms Management

#### `GET /api/forms`
List all forms with response counts.

**Response**: Array of form summaries with computed `response_count`

**Example**:
```json
[
  {
    "id": 1,
    "title": "Customer Feedback Survey",
    "status": "published",
    "share_slug": "XIbQO0rb4FA",
    "response_count": 3
  }
]
```

---

#### `POST /api/forms`
Create a new form in draft status.

**Request Body**:
```json
{
  "title": "My New Form",
  "description": "Optional description",
  "theme_json": {}
}
```

**Response**: Full form object with empty questions array

---

#### `GET /api/forms/{id}`
Get a single form with all questions and options.

**Response**: Complete form with questions ordered by `order_index`

**Example**:
```json
{
  "id": 1,
  "title": "Customer Survey",
  "status": "published",
  "questions": [
    {
      "id": 1,
      "type": "email",
      "title": "What's your email?",
      "required": true,
      "order_index": 0
    }
  ]
}
```

---

#### `PATCH /api/forms/{id}`
Update form metadata (title, description, theme).

**Request Body**: Partial form object (only include fields to update)
```json
{
  "title": "Updated Title"
}
```

**Response**: Updated form object

---

#### `DELETE /api/forms/{id}`
Delete a form and all related data (questions, options, responses, answers).

**Response**: Success message
```json
{
  "message": "Form 1 deleted successfully"
}
```

---

#### `POST /api/forms/{id}/duplicate`
Duplicate a form with all questions and options.

**Behavior**:
- Creates new form in draft status with "(Copy)" appended to title
- Copies all questions and options with same order
- Does NOT copy responses
- New form gets its own ID and has no share_slug

**Response**: Complete duplicated form object

---

#### `POST /api/forms/{id}/publish`
Publish a form, making it publicly accessible.

**Behavior**:
- Changes status to `"published"`
- Generates unique URL-safe `share_slug` (if not already set)
- Idempotent: safe to call multiple times

**Response**: Updated form with `share_slug`

---

#### `POST /api/forms/{id}/unpublish`
Unpublish a form, changing status back to draft.

**Behavior**:
- Changes status to `"draft"`
- Keeps the `share_slug` (can be re-published later)

**Response**: Updated form object

---

### Questions Management

#### `POST /api/forms/{id}/questions`
Add a new question to a form.

**Request Body**:
```json
{
  "type": "multiple_choice",
  "title": "What's your favorite color?",
  "description": "Optional help text",
  "required": true,
  "order_index": 0,
  "settings_json": {},
  "options": [
    {"label": "Red", "order_index": 0},
    {"label": "Blue", "order_index": 1}
  ]
}
```

**Question Types**: `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`

**Response**: Created question with options

---

#### `PATCH /api/forms/{form_id}/questions/{question_id}`
Update a question's properties.

**Request Body**: Partial question object
```json
{
  "title": "Updated question title",
  "required": false,
  "options": [
    {"label": "New Option 1", "order_index": 0}
  ]
}
```

**Behavior**: If `options` is provided, replaces ALL existing options

**Response**: Updated question object

---

#### `DELETE /api/forms/{form_id}/questions/{question_id}`
Delete a question and all its options.

**Response**: Success message

---

#### `PATCH /api/forms/{id}/questions/reorder`
Batch update question order.

**Request Body**:
```json
{
  "question_ids": [3, 1, 2]
}
```

**Behavior**:
- Array order defines new order (first ID gets `order_index=0`, etc.)
- All question IDs must belong to the form
- Updates `order_index` for each question

**Response**: Array of questions in new order

### Responses & Stats (creator-side)

#### `GET /api/forms/{id}/responses`
List all responses for a form (paginated).

**Query Parameters**:
- `skip` (optional): Number of responses to skip (default 0)
- `limit` (optional): Max responses to return (default 50, max 100)

**Response**: Array of lightweight response items, ordered by submission time (newest first)

**Example**:
```
GET /api/forms/1/responses?skip=0&limit=10
```
```json
[
  {
    "id": 8,
    "form_id": 1,
    "submitted_at": "2026-09-25T15:25:03.235834",
    "completed": true
  }
]
```

---

#### `GET /api/forms/{id}/responses/{rid}`
Get full details of a single response with all answers.

**Response**: Complete response object with answers array

**Example**:
```json
{
  "id": 8,
  "form_id": 1,
  "submitted_at": "2026-09-25T15:25:03.235834",
  "completed": true,
  "answers": [
    {
      "id": 1,
      "response_id": 8,
      "question_id": 1,
      "value_text": "user@example.com",
      "value_json": null
    }
  ]
}
```

---

#### `GET /api/forms/{id}/stats`
Get aggregated response statistics for a form.

**Response**: Summary statistics with per-question breakdowns

**Aggregation by question type**:
- **Choice questions** (multiple_choice, dropdown, yes_no): Count per option
- **Rating questions**: Count per rating value (1-max)
- **Text questions** (short_text, long_text, email, number): Total response count

**Example**:
```json
{
  "total_responses": 4,
  "completed_responses": 4,
  "question_stats": [
    {
      "question_id": 2,
      "question_type": "rating",
      "question_title": "How would you rate...?",
      "total_answers": 4,
      "value_distribution": {
        "1": 0,
        "2": 0,
        "3": 1,
        "4": 2,
        "5": 1
      }
    },
    {
      "question_id": 3,
      "question_type": "multiple_choice",
      "question_title": "How did you hear about us?",
      "total_answers": 4,
      "value_distribution": {
        "Social Media": 1,
        "Friend Referral": 2,
        "Search Engine": 1,
        "Advertisement": 0,
        "Other": 0
      }
    }
  ]
}
```

---

## Public Endpoints (Respondent Flow)

### `GET /api/public/forms/{slug}`
Get a published form by its share slug.

**Behavior**:
- Only returns published forms
- Returns 404 if form not found or not published
- Questions ordered by `order_index`
- Does not expose internal metadata like response counts

**Response**: Complete form with questions and options

**Example**:
```
GET /api/public/forms/keFtrRVzfow
```

---

### `POST /api/public/forms/{slug}/responses`
Submit a response to a published form.

**Request Body**:
```json
{
  "answers": [
    {"question_id": 1, "value_text": "user@example.com"},
    {"question_id": 2, "value_text": "5"}
  ],
  "completed": true
}
```

**Server-Side Validation** (per product.md):
- **Required fields**: Must be non-empty
- **Email**: Must match email regex pattern
- **Number**: Must be numeric and within bounds (from `settings_json` min/max)
- **Rating**: Must be integer between 1 and max rating
- **Yes/No**: Must be exactly "Yes" or "No"
- **Multiple choice/Dropdown**: Must match one of the option labels

**Error Response** (400):
```json
{
  "detail": {
    "errors": [
      "Invalid email format for 'What's your email address?'",
      "Rating must be between 1 and 5",
      "Question 'Your name' is required"
    ]
  }
}
```

**Success Response**:
```json
{
  "message": "Response submitted successfully",
  "response_id": 8
}
```

---

All endpoints return proper HTTP status codes:

- **200**: Success
- **404**: Resource not found (form or question)
- **400**: Bad request (validation error, invalid question IDs)
- **422**: Pydantic validation error

Error response format:
```json
{
  "detail": "Form 123 not found"
}
```

## Database Schema

See `app/models.py` for complete schema. Key tables:

- **forms**: Form metadata and status
- **questions**: Questions with type, order, and settings
- **question_options**: Options for multiple_choice/dropdown
- **responses**: Submitted form responses
- **answers**: Individual answer values

## Conventions

1. Questions always returned ordered by `order_index`
2. Options within questions ordered by `order_index`
3. All mutations return the updated resource (no need for refetch)
4. Cascading deletes handle cleanup of related records
5. Single default creator assumed (no authentication)
