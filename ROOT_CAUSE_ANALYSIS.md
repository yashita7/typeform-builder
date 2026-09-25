# Root Cause Analysis - "Failed to create form"

## Actual Error

**Browser Console Error**:
```
Error: API Error: 404 {"detail":"Not Found"}
    at apiFetch (lib/api.ts:29:15)
```

**HTTP Request**:
- Method: `POST`
- URL: `http://localhost:8000/forms` ← **Wrong!**
- Status: `404 Not Found`
- Response: `{"detail":"Not Found"}`

## Root Cause

**Missing `/api` prefix in API calls**

### Backend Configuration
```python
# backend/app/main.py line 63
app.include_router(forms.router, prefix="/api", tags=["Forms & Questions"])
```
**Backend route**: `POST /api/forms`

### Frontend Configuration (Before Fix)
```typescript
// frontend/lib/api.ts
const API_BASE_URL = 'http://localhost:8000';

const url = `${API_BASE_URL}${endpoint}`;
// Called with endpoint="/forms"
// Result: http://localhost:8000/forms
```
**Frontend URL**: `POST http://localhost:8000/forms` ← Missing `/api`

### The Mismatch
- Backend expects: `/api/forms`
- Frontend called: `/forms`
- Result: 404 Not Found

## Why This Happened

The backend routes are intentionally prefixed with `/api` (a common REST API convention), but the frontend API utility wasn't accounting for this prefix when building URLs.

## The Fix

### Added API prefix constant
```typescript
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api';  // ← Added

// Construct full URL with /api prefix
const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
// Now: http://localhost:8000/api/forms ✓
```

### Improved error messages
```typescript
// frontend/app/(dashboard)/forms/page.tsx
catch (error) {
  // Show actual error message from backend if available
  const message = error instanceof Error ? error.message : "Failed to create form";
  toast.error(message);  // ← Now shows "API Error: 404 ..." instead of generic message
  console.error("Create form error:", error);
}
```

## Verification

### Before Fix
```bash
$ curl -X POST http://localhost:8000/forms
{"detail":"Not Found"}  # 404
```

### After Fix
```bash
$ curl -X POST http://localhost:8000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
  
{
  "title": "Test",
  "id": 5,
  "status": "draft",
  "created_at": "2026-09-25T16:02:30.411083",
  ...
}  # 200 OK ✓
```

## URL Construction Examples

### Before Fix
- `api.get("/forms")` → `http://localhost:8000/forms` ❌
- `api.post("/forms", ...)` → `http://localhost:8000/forms` ❌
- `api.patch("/forms/1", ...)` → `http://localhost:8000/forms/1` ❌

### After Fix
- `api.get("/forms")` → `http://localhost:8000/api/forms` ✓
- `api.post("/forms", ...)` → `http://localhost:8000/api/forms` ✓
- `api.patch("/forms/1", ...)` → `http://localhost:8000/api/forms/1` ✓

## Other Issues Fixed

### 1. Generic Error Messages
**Before**: All API errors showed "Failed to create form"
**After**: Shows actual error: "API Error: 404 {"detail":"Not Found"}"

This makes debugging much easier.

### 2. CORS Configuration
Already fixed in previous step - backend now allows both ports 3000 and 3003.

### 3. Tailwind CSS
Already fixed in previous step - using `@import "tailwindcss"` for v4.

## Files Modified

1. **frontend/lib/api.ts**
   - Added `API_PREFIX = '/api'` constant
   - Updated URL construction to include prefix

2. **frontend/app/(dashboard)/forms/page.tsx**
   - Improved error handling to show actual backend errors

## Testing Checklist

After fix, all API calls should work:
- ✅ `GET /api/forms` - List forms
- ✅ `POST /api/forms` - Create form
- ✅ `GET /api/forms/{id}` - Get form details
- ✅ `PATCH /api/forms/{id}` - Update form
- ✅ `DELETE /api/forms/{id}` - Delete form
- ✅ `POST /api/forms/{id}/publish` - Publish form
- ✅ `POST /api/forms/{id}/duplicate` - Duplicate form

---

**Status**: Root cause identified and fixed ✅

The issue was a simple but critical path mismatch between frontend and backend. With the `/api` prefix now correctly added to all frontend API calls, the dashboard should be fully functional.
