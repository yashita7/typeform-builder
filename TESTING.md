# Testing Guide

## Manual Testing Checklist

### 1. Form Builder (Creator Side)
- [x] Dashboard shows list of forms
- [x] Create new form via modal
- [x] Rename form inline (click title)
- [x] Duplicate form
- [x] Delete form (with confirmation)
- [x] Publish/unpublish form
- [x] Copy shareable link
- [x] Navigate to form builder

### 2. Form Builder Editor
- [x] View ordered question list
- [x] Drag and drop to reorder questions
- [x] Add new questions (all 8 types)
- [x] Edit question title and description
- [x] Toggle required field
- [x] Edit type-specific settings:
  - [x] Multiple choice: add/edit/delete options
  - [x] Dropdown: add/edit/delete options
  - [x] Rating: select max stars
  - [x] Number: set min/max bounds
- [x] See live preview update as you type
- [x] Autosave with "Saved" indicator
- [x] Delete question (with confirmation)

### 3. Respondent Flow (Public)
To test: Open http://localhost:3003/f/keFtrRVzfow

- [ ] One question at a time display
- [ ] Progress bar at top
- [ ] Question number indicator
- [ ] All question types render correctly:
  - [ ] Short text with underline input
  - [ ] Long text with textarea
  - [ ] Email with format validation
  - [ ] Number with bounds validation
  - [ ] Multiple choice with radio buttons (auto-advance)
  - [ ] Dropdown with select menu
  - [ ] Yes/No with large buttons (auto-advance)
  - [ ] Rating with star selector (auto-advance)
- [ ] Keyboard navigation:
  - [ ] Enter to advance
  - [ ] Arrow up to go back
  - [ ] Arrow down to advance
- [ ] Validation errors display
- [ ] Required field validation
- [ ] Submit button on last question
- [ ] Thank you screen after submission

### 4. Response Management
- [ ] Navigate to responses page from dashboard
- [ ] View response count
- [ ] See summary statistics per question
- [ ] View individual response details
- [ ] Responses table with submission time
- [ ] Modal with full response details

## Quick Test URLs

### Backend (API Docs)
http://localhost:8000/docs

### Frontend Pages
- Dashboard: http://localhost:3003/forms
- Form Builder: http://localhost:3003/forms/1/edit
- Responses: http://localhost:3003/forms/1/responses
- Public Form: http://localhost:3003/f/keFtrRVzfow

## Sample API Calls

### Get Published Form
```bash
curl http://localhost:8000/api/public/forms/keFtrRVzfow
```

### Submit Response
```bash
curl -X POST http://localhost:8000/api/public/forms/keFtrRVzfow/responses \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": 1, "value_text": "Test answer"},
      {"question_id": 2, "value_text": "Option A"}
    ],
    "completed": true
  }'
```

### Get Form Responses
```bash
curl http://localhost:8000/api/forms/1/responses
```

### Get Form Stats
```bash
curl http://localhost:8000/api/forms/1/stats
```

## Known Issues
- None currently

## Performance Notes
- Autosave debounces at 500ms
- Drag and drop reorder sends API call immediately
- No pagination implemented yet (responses will all load at once)
