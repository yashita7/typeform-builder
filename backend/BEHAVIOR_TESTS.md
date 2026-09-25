# API Behavior Test Results

## Summary

✅ All four critical behaviors verified and documented.

| # | Behavior | Status | Code Reference |
|---|----------|--------|----------------|
| 1 | Duplicate (deep copy) | Already correct | `forms.py:185-237` |
| 2 | Cascade deletes | **Fixed** (added PRAGMA) | `db.py:20-25` |
| 3 | Publish idempotency | Already correct | `forms.py:245-247` |
| 4 | Reorder validation | Already correct | `forms.py:309-314` |

---

## 1. Duplicate: Deep Copy with New IDs

**What was checked**: `POST /api/forms/{id}/duplicate` copies questions AND question_options with fresh IDs.

**Finding**: ✅ Already correct

**Test output**:
```
Original: 5 questions with options
Duplicate: 5 questions with NEW IDs and NEW option IDs
```

**Interview pointer**: Lines 208-210 and 222-230 in `forms.py` show the two deep copy loops with `db.flush()` to get new IDs. Comments added: "Deep copy: duplicate all questions with new IDs" and "Deep copy: duplicate all options with new IDs".

---

## 2. Cascade Deletes: Database-Level Enforcement

**What was checked**: Deleting a form removes questions, question_options, responses, and answers from the actual database (not just SQLAlchemy session).

**Finding**: ✅ Fixed - Added `PRAGMA foreign_keys=ON` to SQLite connections

**What was added**: `db.py` lines 20-25:
```python
# Enable foreign key constraints in SQLite (required for CASCADE DELETE)
# SQLite disables foreign keys by default; this ensures cascade deletes work at DB level
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

**Why needed**: SQLite disables foreign keys by default. Without this pragma, cascade deletes only work in SQLAlchemy's in-memory session, not in the actual database file. The pragma must be set on every connection (it doesn't persist).

**Test output**:
```
Before delete: 1 question(s), 2 option(s) in database
After delete: 0 question(s), 0 option(s) in database
```

**Interview pointer**: Point to the `@event.listens_for(engine, "connect")` decorator in `db.py` that sets the pragma, and explain SQLite's per-connection requirement. Also mention the SQLAlchemy cascade config in `models.py:30-31` (`cascade="all, delete-orphan"`).

---

## 3. Publish Idempotency: Preserves Existing Slug

**What was checked**: Calling `POST /api/forms/{id}/publish` multiple times on a published form keeps the same `share_slug` (doesn't regenerate).

**Finding**: ✅ Already correct

**Test output**:
```
First publish  → slug: VGtEN_aK4qM
Second publish → slug: VGtEN_aK4qM (same)
```

**Why it matters**: If re-publishing generated a new slug, any previously shared public links would break.

**Interview pointer**: Lines 245-247 in `forms.py` show the early return when already published. Comment updated to "Idempotent: if already published, return as-is without changing slug". Also line 252 checks `if not form.share_slug` before generating.

---

## 4. Reorder Validation: Rejects Invalid Question IDs

**What was checked**: `PATCH /api/forms/{id}/questions/reorder` rejects (400 error) a payload containing a question_id that doesn't belong to the form.

**Finding**: ✅ Already correct

**Test output**:
```
Request: {"question_ids": [19, 9999]}
Response: 400 - "Question 9999 does not belong to form 3"
```

**Why it matters**: Without validation, a malicious client could manipulate question orders across forms or access questions they shouldn't.

**Interview pointer**: Lines 309-314 in `forms.py` show the validation loop that checks each ID against `question_map`. Comment updated to "Validation: verify all provided IDs belong to this form".

---

## Code Changes Made

1. **db.py** - Added PRAGMA foreign_keys=ON event listener (lines 20-25)
2. **forms.py** - Enhanced comments for interview clarity:
   - Line 185: Added "Deep copy" comments  
   - Line 245: Added "Idempotent" comment
   - Line 169: Updated cascade delete docstring
   - Line 290: Updated reorder validation docstring
   - Line 309: Added "Validation" comment

All changes are additive (no behavior modifications, only clarity improvements and the SQLite pragma fix).

---

## Running the Tests

```bash
cd backend
source .venv/bin/activate
python << 'EOF'
import requests
API = "http://localhost:8000/api"

# Test 1: Duplicate deep copy
r = requests.post(f"{API}/forms/1/duplicate")
print(f"1. Duplicate: {len(r.json()['questions'])} questions copied")

# Test 2: Cascade delete
r = requests.post(f"{API}/forms", json={"title": "Test"})
fid = r.json()['id']
requests.delete(f"{API}/forms/{fid}")
print(f"2. Cascade: {requests.get(f'{API}/forms/{fid}').status_code} (should be 404)")

# Test 3: Idempotent publish
r = requests.post(f"{API}/forms", json={"title": "Test"})
fid = r.json()['id']
s1 = requests.post(f"{API}/forms/{fid}/publish").json()['share_slug']
s2 = requests.post(f"{API}/forms/{fid}/publish").json()['share_slug']
print(f"3. Idempotent: {s1 == s2}")

# Test 4: Reorder validation
r = requests.post(f"{API}/forms", json={"title": "Test"})
fid = r.json()['id']
r = requests.post(f"{API}/forms/{fid}/questions", 
                 json={"type":"short_text","title":"Q","required":True,"order_index":0})
qid = r.json()['id']
r = requests.patch(f"{API}/forms/{fid}/questions/reorder",
                  json={"question_ids": [qid, 9999]})
print(f"4. Validation: returns {r.status_code} (should be 400)")
EOF
```
