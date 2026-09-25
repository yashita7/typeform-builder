# Form Builder Implementation

## Summary

✅ Full-featured form builder with drag-and-drop, all 8 question types, live preview, and autosave.

**URL Pattern**: `/forms/[id]/edit`

---

## Features Implemented

### Core Features (per product.md)

#### ✅ Drag-and-Drop Question Reordering
- Uses `@dnd-kit/core` and `@dnd-kit/sortable`
- Smooth animations during drag
- Visual feedback (drag handle, hover states)
- Persists order via `/api/forms/{id}/questions/reorder`

#### ✅ All 8 Question Types
1. **Short text** - Single-line text input
2. **Long text** - Multi-line textarea
3. **Multiple choice** - Radio button options
4. **Dropdown** - Select menu
5. **Email** - Email validation
6. **Number** - Numeric input with min/max bounds
7. **Yes/No** - Binary choice buttons
8. **Rating** - Star rating (configurable 3-10 stars)

#### ✅ Add Question Flow
- "Add question" button with dropdown menu
- Icons for each question type
- Default titles and settings for each type
- Auto-selects newly added question

#### ✅ Per-Question Editor
- **Title** - Main question text (required, autosaves)
- **Description** - Optional help text (autosaves)
- **Required toggle** - Mark as required field
- **Type-specific settings**:
  - Multiple choice/dropdown: Add/edit/delete options
  - Rating: Choose max stars (3, 4, 5, 7, 10)
  - Number: Set min/max bounds

#### ✅ Live Preview Panel
- Mirrors respondent-flow styling
- Updates in real-time as you type
- Shows question number, title, description
- Renders appropriate input for each question type
- Matches Typeform's one-question-at-a-time aesthetic

#### ✅ Autosave
- Debounced text field updates (500ms)
- Immediate save for toggles and dropdowns
- "Saved" indicator with timestamp
- Shows "Saving..." during requests
- No manual save button needed

---

## Component Architecture

### Page Component
**File**: `app/(dashboard)/forms/[id]/edit/page.tsx`

**State Management**:
- Form and questions loaded from API
- Selected question ID for editor/preview
- Saving state and last saved timestamp
- Drag-and-drop state via `@dnd-kit`

**Key Functions**:
- `loadForm()` - Fetch form with questions
- `handleAddQuestion()` - Create new question
- `handleUpdateQuestion()` - Autosave changes
- `handleDeleteQuestion()` - Remove question with confirmation
- `handleDragEnd()` - Reorder questions

### Builder Components

#### 1. QuestionListItem
**File**: `components/builder/QuestionListItem.tsx`

**Features**:
- Drag handle with grip icon
- Question number badge
- Type label and required indicator
- Truncated title preview
- Delete button (hover to show)
- Selected state styling

**Drag & Drop**:
- Uses `useSortable` hook
- Custom drag handle (doesn't drag on click anywhere)
- Visual feedback during drag

#### 2. AddQuestionMenu
**File**: `components/builder/AddQuestionMenu.tsx`

**Features**:
- Dropdown menu with all 8 types
- Icon for each type (emoji)
- Backdrop to close on outside click
- Clean, accessible UI

#### 3. QuestionEditor
**File**: `components/builder/QuestionEditor.tsx`

**Features**:
- Title and description inputs with autosave
- Required toggle switch
- Type badge (read-only)
- Type-specific settings panels:
  - **Options editor** (multiple choice/dropdown):
    - Add/edit/delete options
    - Numbered list
    - Minimum 1 option
  - **Rating settings**: Max stars dropdown
  - **Number settings**: Min/max inputs

**Autosave Logic**:
- Text fields: 500ms debounce
- Toggles/dropdowns: Immediate save
- Updates local state on question change

#### 4. QuestionPreview
**File**: `components/builder/QuestionPreview.tsx`

**Features**:
- Mimics respondent flow styling
- Question number and title
- Description (if present)
- Required indicator (*)
- Type-appropriate input rendering
- "Press Enter to continue" hint
- Disabled state (preview only)

**Input Renderings**:
- Short text: Underline border
- Long text: Bordered textarea
- Email: Email input with placeholder
- Number: Number input with min/max hint
- Multiple choice: Radio-style buttons
- Dropdown: Select element
- Yes/No: Two large buttons
- Rating: Star icons with scale

---

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header: Form title, Back button, Saved indicator   │
├──────────┬────────────────────────┬─────────────────┤
│          │                        │                 │
│ Question │  Question Editor       │  Live Preview   │
│ List     │                        │                 │
│          │  - Title               │  - Question 1   │
│ [+] Add  │  - Description         │  - Title        │
│          │  - Required ☑          │  - Description  │
│ [≡] Q1   │  - Type settings       │  - Input        │
│ [≡] Q2   │                        │                 │
│ [≡] Q3   │                        │                 │
│          │                        │                 │
│ (drag &  │  (editable fields)     │  (read-only)    │
│  drop)   │                        │                 │
│          │                        │                 │
└──────────┴────────────────────────┴─────────────────┘
   320px         flex-1 (main)           384px
```

---

## User Flows

### Adding a Question
1. Click "Add question" button
2. Select question type from menu
3. New question appears in list (auto-selected)
4. Editor opens with default values
5. Preview shows the question
6. Edit title → autosaves after 500ms
7. Configure settings → saves immediately

### Reordering Questions
1. Hover over question in list
2. Grab the drag handle (≡ icon)
3. Drag up or down
4. Drop in new position
5. List reorders visually
6. Backend persists new order
7. "Saved" indicator updates

### Editing a Question
1. Click question in list to select
2. Edit title in editor → autosaves
3. Add description → autosaves
4. Toggle required → saves immediately
5. Preview updates in real-time
6. No manual save needed

### Deleting a Question
1. Hover over question in list
2. Click delete icon (trash)
3. Confirm in browser alert
4. Question removed from list
5. Next question auto-selected

---

## Autosave Implementation

### Debounced Text Fields
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (title !== question.title || description !== question.description) {
      onUpdate({ title, description });
    }
  }, 500);
  return () => clearTimeout(timer);
}, [title, description]);
```

**Behavior**:
- Waits 500ms after last keystroke
- Only saves if value actually changed
- Cancels pending save on unmount

### Immediate Saves
```typescript
function handleRequiredChange(value: boolean) {
  setRequired(value);
  onUpdate({ required: value });  // Immediate
}
```

**Triggers**:
- Required toggle
- Settings changes (rating max, number bounds)
- Options add/edit/delete

### Save Indicator
```typescript
{saving ? (
  <span>Saving...</span>
) : lastSaved ? (
  <span>Saved {formatTime(lastSaved)}</span>
) : (
  <span>All changes saved</span>
)}
```

**States**:
- "Saving..." - During API request
- "Saved 2s ago" - After successful save
- "All changes saved" - Initial state

---

## API Integration

### Load Form
```
GET /api/forms/{id}
→ Returns form with questions array (ordered by order_index)
```

### Add Question
```
POST /api/forms/{id}/questions
Body: { type, title, order_index, options?, settings_json? }
→ Returns created question with new ID
```

### Update Question
```
PATCH /api/forms/{id}/questions/{qid}
Body: { title?, description?, required?, options?, settings_json? }
→ Returns updated question
```

### Delete Question
```
DELETE /api/forms/{id}/questions/{qid}
→ Returns success message
```

### Reorder Questions
```
PATCH /api/forms/{id}/questions/reorder
Body: { question_ids: [3, 1, 2] }
→ Returns questions in new order
```

---

## Drag & Drop Configuration

### Sensors
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),      // Mouse/touch
  useSensor(KeyboardSensor, {    // Keyboard navigation
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### Context
```typescript
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={questions.map(q => q.id)}
    strategy={verticalListSortingStrategy}
  >
    {/* Sortable items */}
  </SortableContext>
</DndContext>
```

### Sortable Item
```typescript
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
  useSortable({ id: question.id });
```

---

## Default Values

### Question Titles
- Short text: "Short answer question"
- Long text: "Long answer question"
- Multiple choice: "Multiple choice question"
- Dropdown: "Dropdown question"
- Email: "Email address"
- Number: "Number question"
- Yes/No: "Yes or no question"
- Rating: "Rating question"

### Question Settings
- Rating: `{ max: 5 }`
- Number: `{ min: 0, max: 100 }`
- Others: `null`

### Options
- Multiple choice/dropdown: `[{ label: "Option 1", order_index: 0 }]`

---

## Styling Notes

### Colors
- Background: White
- Sidebar: `bg-neutral-50`
- Selected: `border-neutral-900`, `shadow-sm`
- Unselected: `border-neutral-200`
- Hover: `border-neutral-300`

### Typography
- Form title: `text-xl font-semibold`
- Question title (editor): `text-lg`
- Question title (preview): `text-2xl font-semibold`
- Labels: `text-sm font-medium text-neutral-700`

### Spacing
- Sidebar: `w-80` (320px)
- Preview: `w-96` (384px)
- Editor: `flex-1` with `max-w-3xl` padding

---

## Accessibility Notes

- Drag handle is separate from click target
- Keyboard navigation supported via `KeyboardSensor`
- Labels on all form fields
- Disabled state for preview inputs
- Focus states on interactive elements

---

## Next Steps

With the builder complete, remaining features:
1. ✅ Dashboard
2. ✅ Builder
3. [ ] Respondent flow (one-question-at-a-time)
4. [ ] Results viewer (responses and stats)

---

**Status**: Form builder fully implemented ✅

All 8 question types, drag-and-drop, live preview, and autosave working correctly.
