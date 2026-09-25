# API Behavior Verification Report

This document verifies the four critical behaviors requested before moving forward.

---

## 1. ✅ Duplicate: Deep Copy with New IDs

**Status**: **Already Correct** (no fix needed)

**Behavior**: `POST /api/forms/{id}/duplicate` creates a full deep copy of the form, including all questions and their options, with fresh IDs for every entity.

**Code Location**: `backend/app/routers/forms.py` lines 185-237

**Key Implementation Details**:
```python
# Deep copy: duplicate all questions with new IDs
original_questions = sorted(original_form.questions, key=lambda q: q.order_index)
for orig_question in original_questions:
    new_question = Question(...)  # Creates NEW question with new ID
    db.flush()  # Get new_question.id
    
    # Deep copy: duplicate all options with new IDs
    for orig_option in original_options:
        new_option = QuestionOption(...)  # Creates NEW option with new ID
```

**Test Result**:
```
Original form 1:
  Questions: 5
    - multiple_choice: How did you hear about us? (ID 3, 5 options)

Duplicate form 4:
  Questions: 5
    - multiple_choice: How did you hear about us? (NEW ID 21, 5 options)
      • Social Media (NEW ID 13)
      • Friend Referral (NEW ID 14)
      • Search Engine (NEW ID 15)

✓ Questions have new IDs (deep copy verified)
```

**Interview Pointer**: Point to the two "Deep copy" comments in the `duplicate_form` function showing question and option duplication with `db.flush()` to get new IDs.

---

## 2. ✅ Cascade Deletes: Database-Level Enforcement

**Status**: **Fixed** (added PRAGMA foreign_keys=ON)

**Behavior**: Deleting a form removes all related records (questions, question_options, responses, answers) from the actual database, not just the SQLAlchemy session.

**Code Location**: 
- **SQLAlchemy cascade config**: `backend/app/models.py` lines 30-31, 56-57, 93
- **SQLite foreign keys pragma**: `backend/app/db.py` lines 20-25

**Key Implementation Details**:

1. **models.py** - Cascade configured in relationships:
```python
questions = relationship("Question", back_populates="form", cascade="all, delete-orphan")
responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")
```

2. **db.py** - SQLite foreign keys enabled on every connection:
```python
# Enable foreign key constraints in SQLite (required for CASCADE DELETE)
# SQLite disables foreign keys by default; this ensures cascade deletes work at DB level
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

**Why This is Needed**: SQLite disables foreign key constraints by default. Without `PRAGMA foreign_keys=ON`, cascade deletes only work at the SQLAlchemy ORM level (in-memory), not in the actual database. This pragma must be set on every connection because SQLite doesn't persist it.

**Test Result**:
```
1. Created form ID: 4 with question and 2 options
2. DB state BEFORE delete: 1 question(s), 2 option(s)
3. Deleted form via API
4. DB state AFTER delete: 0 question(s), 0 option(s)

✓ Cascade delete works at DATABASE level (records actually removed)
```

**Interview Pointer**: Point to the `@event.listens_for` decorator in `db.py` that sets PRAGMA foreign_keys=ON, and explain why SQLite needs this per-connection pragma.

---

## 3. ✅ Publish Idempotency: Preserves Existing Slug

**Status**: **Already Correct** (no fix needed)

**Behavior**: Calling `POST /api/forms/{id}/publish` on an already-published form is idempotent—it keeps the existing `share_slug` rather than generating a new one, preventing shared links from breaking.

**Code Location**: `backend/app/routers/forms.py` lines 240-262

**Key Implementation Details**:
```python
def publish_form(form_id: int, db: Session = Depends(get_db)):
    """
    Idempotent: calling this on an already-published form keeps the existing slug.
    """
    form = get_form_or_404(db, form_id)
    
    # Idempotent: if already published, return as-is without changing slug
    if form.status == "published":
        form.questions = sorted(form.questions, key=lambda q: q.order_index)
        return form
    
    # Only generate slug if not already set
    form.status = "published"
    if not form.share_slug:
        form.share_slug = generate_unique_slug(db)
```

**Test Result**:
```
Created form ID: 4
  First publish -> slug: 8GIPx2P_Xto
  Second publish -> slug: 8GIPx2P_Xto

✓ Slug unchanged (idempotent)
```

**Why This Matters**: If re-publishing generated a new slug, any previously shared links would break. This check ensures published forms can be "re-published" (perhaps after unpublishing) without losing their public URL.

**Interview Pointer**: Point to the early return when `form.status == "published"` and the `if not form.share_slug` check that prevents regeneration.

---

## 4. ✅ Reorder Validation: Rejects Invalid Question IDs

**Status**: **Already Correct** (no fix needed)

**Behavior**: `PATCH /api/forms/{id}/questions/reorder` validates that all question IDs in the request belong to the specified form. Returns 400 if any ID doesn't belong.

**Code Location**: `backend/app/routers/forms.py` lines 290-312

**Key Implementation Details**:
```python
def reorder_questions(form_id: int, reorder_data: ReorderQuestionsRequest, ...):
    """
    Validates that all question IDs belong to this form (400 if not).
    """
    # Get all questions for this form
    questions = db.query(Question).filter(Question.form_id == form_id).all()
    question_map = {q.id: q for q in questions}
    
    # Validation: verify all provided IDs belong to this form
    for question_id in reorder_data.question_ids:
        if question_id not in question_map:
            raise HTTPException(
                status_code=400,
                detail=f"Question {question_id} does not belong to form {form_id}"
            )
```

**Test Result**:
```
Created form 4 with questions 19 and 20

Attempting reorder with invalid question ID 999...
  ✓ Rejected with 400: Question 999 does not belong to form 4

✓ Reorder validation working
```

**Why This Matters**: Without this validation, a malicious or buggy client could send question IDs from a different form, potentially corrupting the question order or accessing questions they shouldn't.

**Interview Pointer**: Point to the "Validation" comment and the loop that checks each ID exists in `question_map`.

---

## Summary

| Behavior | Status | Code Location | Interview Pointer |
|----------|--------|---------------|-------------------|
| 1. Duplicate deep copy | ✅ Correct | `forms.py:185-237` | "Deep copy" comments + `db.flush()` |
| 2. Cascade deletes | ✅ Fixed | `db.py:20-25`, `models.py:30` | `@event.listens_for` PRAGMA |
| 3. Publish idempotency | ✅ Correct | `forms.py:240-262` | Early return + slug check |
| 4. Reorder validation | ✅ Correct | `forms.py:290-312` | "Validation" comment + loop |

All four behaviors are now correctly implemented with clear comments for interview explanation.
