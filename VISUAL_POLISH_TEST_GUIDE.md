# Visual Polish Testing Guide 🧪

## Quick Start Test

1. **Start the application**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   source .venv/bin/activate
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Open**: http://localhost:3000

---

## 🎨 Visual Elements to Test

### Global Animations
- [ ] Page transitions are smooth (no jank)
- [ ] All buttons have scale-down effect on click
- [ ] Hover states appear smoothly with proper timing
- [ ] Focus rings appear on keyboard navigation

### Dashboard (`/forms`)

#### Empty State
1. Delete all forms to see empty state
2. Check:
   - [ ] Large emoji (📝) appears
   - [ ] "Create your first form" button is prominent
   - [ ] Button has hover and active states

#### Form Cards
1. Create a few forms
2. Check each card:
   - [ ] Hover shows shadow and border change smoothly
   - [ ] Status badge shows bullet indicator (● or ○)
   - [ ] Response count link changes color on hover
   - [ ] Edit button has scale effect on click
   - [ ] Publish/Unpublish transitions smoothly
   - [ ] Duplicate and Delete buttons have hover states

3. Publish a form:
   - [ ] Shareable link panel animates in smoothly
   - [ ] Copy button shows feedback

4. Click Delete:
   - [ ] Modal animates in (backdrop fade + content scale)
   - [ ] Warning emoji (⚠️) is visible
   - [ ] Both buttons have active states
   - [ ] Modal animates out on cancel or confirm

#### Create Form Modal
1. Click "Create form" button
2. Check:
   - [ ] Modal animates in smoothly (backdrop + scale/slide)
   - [ ] Input has proper focus on open
   - [ ] Border becomes darker on input focus
   - [ ] Create button is disabled when empty
   - [ ] Buttons have active:scale-95 on click
   - [ ] ESC key closes modal
   - [ ] Click outside closes modal
   - [ ] Modal animates out smoothly

#### Loading State
1. Refresh page
2. Check:
   - [ ] Skeleton cards pulse smoothly
   - [ ] Layout doesn't shift when real cards load

---

### Builder (`/forms/[id]/edit`)

#### Header
- [ ] "Back" link changes color on hover
- [ ] Save status updates and animates (spinner when saving)
- [ ] Time "just now", "5s ago", etc. displays correctly
- [ ] Settings and Responses buttons have hover states

#### Tabs
- [ ] Questions tab has active indicator (bottom border)
- [ ] Logic tab shows "Soon" badge
- [ ] Clicking Logic shows Coming Soon panels
- [ ] Tab transitions are smooth

#### Questions Tab - Left Sidebar

1. **Add Question Menu**:
   - [ ] Menu opens with smooth animation
   - [ ] Backdrop appears and closes menu on click
   - [ ] Each question type has icon and hover state
   - [ ] "Coming Soon" section is visually distinct
   - [ ] File Upload & Payment show toast on click

2. **Question List**:
   - [ ] Drag handles are visible
   - [ ] Dragging shows opacity change
   - [ ] Selected question has border and shadow
   - [ ] Delete button appears on hover
   - [ ] Confirm dialog for delete

3. **Empty State**:
   - [ ] Shows when no questions
   - [ ] Emoji and helpful text visible

#### Questions Tab - Center Editor
- [ ] Selected question loads in editor
- [ ] All inputs have proper focus states
- [ ] Toggle switches work smoothly
- [ ] Changes trigger save indicator in header

#### Questions Tab - Right Preview
- [ ] Shows "Live Preview" label
- [ ] Updates when question changes
- [ ] Matches respondent flow styling

#### Logic Tab
1. Switch to Logic tab
2. Check:
   - [ ] All Coming Soon panels animate in
   - [ ] Main panel is larger with features list
   - [ ] Icons animate with spring effect
   - [ ] Feature checkmarks animate in sequence
   - [ ] "Coming Soon" badges are visible

---

### Respondent Flow (`/f/[slug]`)

#### Before Testing
1. Publish a form
2. Add various question types
3. Copy the shareable link

#### Load Form
- [ ] Progress bar at top (1px height)
- [ ] First question animates in

#### Navigation
1. Answer questions and press Enter
2. Check:
   - [ ] Smooth forward animation (slide left)
   - [ ] Progress bar animates smoothly
   - [ ] Question number updates (1 → 3)
   - [ ] Large question title (text-4xl)
   - [ ] Generous spacing around elements

3. Press ↑ (Up arrow) to go back:
   - [ ] Smooth backward animation (slide right)
   - [ ] Previous answer is preserved

#### Question Types

**Short Text**:
- [ ] Bottom border becomes darker on focus
- [ ] Enter advances to next question
- [ ] Placeholder text is visible

**Long Text**:
- [ ] Shift+Enter adds new line
- [ ] Plain Enter advances
- [ ] Keyboard hint shows both actions

**Multiple Choice**:
- [ ] Options have hover state
- [ ] Selected option shows filled circle
- [ ] Auto-advances after 300ms

**Yes/No**:
- [ ] Both buttons have hover and selected states
- [ ] Selected button is dark with white text
- [ ] Auto-advances after selection

**Rating**:
- [ ] Stars scale up on hover
- [ ] Selected stars are full opacity
- [ ] Min/max labels show correctly
- [ ] Auto-advances after selection

**Dropdown**:
- [ ] Opens on click
- [ ] Hover states on options
- [ ] Selected value shows in dropdown

**Email**:
- [ ] Type validation on submit
- [ ] Error message animates in with icon

**Number**:
- [ ] Min/max hints display below
- [ ] Validation works
- [ ] Number spinner controls work

#### Error States
1. Leave required field empty and press Enter
2. Check:
   - [ ] Error box animates in from top
   - [ ] Warning icon (⚠️) is visible
   - [ ] Red accent color is clear
   - [ ] Error message is helpful

#### Completion
1. Complete the form
2. Check:
   - [ ] Thank you screen animates in (scale)
   - [ ] Checkmark emoji animates with spring
   - [ ] Text staggers in (delays increase)
   - [ ] Overall smooth and delightful

#### Not Found
1. Visit `/f/invalid-slug`
2. Check:
   - [ ] Search emoji (🔍) animates in
   - [ ] Error message is clear
   - [ ] Layout is centered and clean

---

### Responses Page (`/forms/[id]/responses`)

#### Header
- [ ] Back button has hover state
- [ ] Status badge shows correct color
- [ ] Copy link button works
- [ ] Edit form button navigates correctly

#### Summary Stats (with responses)
1. Submit a form a few times
2. Check:
   - [ ] Stat cards have hover shadow
   - [ ] Bar charts animate smoothly (500ms)
   - [ ] Percentages display correctly
   - [ ] Colors are consistent

#### Responses Table
- [ ] Header row has gray background
- [ ] Rows have hover state (background change)
- [ ] Status badges are colored correctly
- [ ] "View details" changes on hover

#### Empty State (no responses)
1. Create new form with no responses
2. Check:
   - [ ] Empty state emoji (📊) is visible
   - [ ] Message is encouraging
   - [ ] Suggestion to share form

#### Response Detail Modal
1. Click "View details" on a response
2. Check:
   - [ ] Modal animates in (backdrop + scale/slide)
   - [ ] Close button has hover state
   - [ ] Answers stagger in (each delays by 50ms)
   - [ ] Border-left accent on answers
   - [ ] Question types show as badges
   - [ ] Modal animates out smoothly
   - [ ] Click outside closes modal

---

### Settings Page (`/forms/[id]/settings`)

#### Header
- [ ] Back button works
- [ ] Form title displays
- [ ] Edit questions button navigates

#### Coming Soon Panels
Check all four panels animate in:
1. **Theme Customization**:
   - [ ] Palette emoji (🎨)
   - [ ] 5 features listed
   - [ ] Each feature has checkmark

2. **Thank You Screen**:
   - [ ] Sparkles emoji (✨)
   - [ ] 5 features listed
   - [ ] Proper grid layout

3. **Integrations & Webhooks**:
   - [ ] Link emoji (🔗)
   - [ ] 5 features listed
   - [ ] "Coming Soon" badge visible

4. **Team Collaboration**:
   - [ ] People emoji (👥)
   - [ ] 5 features listed
   - [ ] Feature checkmarks animate in sequence

---

## 🎯 Interaction Testing

### Keyboard Navigation
1. Use Tab to navigate through forms list
2. Check:
   - [ ] Focus rings are visible
   - [ ] Tab order is logical
   - [ ] Enter activates buttons
   - [ ] ESC closes modals

### Mobile Responsiveness
1. Resize browser window or use dev tools
2. Check:
   - [ ] Dashboard grid adjusts (1→2→3 columns)
   - [ ] Modals fit on small screens
   - [ ] Builder layout remains usable
   - [ ] Respondent flow works on mobile
   - [ ] Touch interactions work

### Performance
- [ ] No layout shifts during page load
- [ ] Animations run at 60fps (smooth)
- [ ] No console errors
- [ ] Images/icons load quickly
- [ ] Transitions don't block interactions

---

## 🐛 Edge Cases

### Dashboard
- [ ] Very long form title wraps correctly (line-clamp-2)
- [ ] Many forms (20+) scroll properly
- [ ] Rapid clicking doesn't break state

### Builder
- [ ] Empty question title shows placeholder
- [ ] Maximum questions handled well
- [ ] Dragging last question works
- [ ] Deleting selected question selects another

### Respondent Flow
- [ ] Very long question text wraps
- [ ] Many options in multiple choice display well
- [ ] Large rating max (10 stars) fits
- [ ] Long text answer preserves formatting

### Responses
- [ ] Many responses (100+) display efficiently
- [ ] Very long answer text wraps in modal
- [ ] Missing data shows "No answer provided"

---

## ✅ Success Criteria

All checks should pass with:
- ✅ Smooth animations (no jank or stuttering)
- ✅ Consistent timing (200ms micro, 300ms modals)
- ✅ Proper hover states on all interactive elements
- ✅ Clear focus indicators for accessibility
- ✅ Loading and empty states always shown
- ✅ No console errors
- ✅ Typeform-like feel throughout

---

## 🎨 Visual Consistency Checklist

Compare with Typeform's actual interface:
- [ ] Type scale matches (large titles, readable body)
- [ ] Spacing is generous (not cramped)
- [ ] Colors are neutral with bold accents
- [ ] Buttons have clear hierarchy
- [ ] Cards have proper elevation
- [ ] Forms feel "conversational"
- [ ] Interface feels modern and clean
- [ ] Nothing feels "default" or unstyled

---

## 📸 Screenshot Testing Areas

Capture and compare:
1. Dashboard with 3-6 forms
2. Create form modal
3. Builder with 3-5 questions selected
4. Logic tab view
5. Respondent flow - question view
6. Respondent flow - thank you screen
7. Responses page with stats
8. Response detail modal
9. Settings page with all panels
10. Mobile view of dashboard

---

## 🚀 Final Check

Before declaring complete:
- [ ] Run `npm run build` - no errors
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test on mobile device
- [ ] All Coming Soon features documented
- [ ] No placeholder text like "TODO" remains
- [ ] All animations feel intentional, not gimmicky
- [ ] The app feels production-ready

If all checks pass: Visual polish is complete! ✨
