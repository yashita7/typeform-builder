# Manual Testing Guide - Respondent Flow

## 🎯 Quick Test (2 minutes)

**URL**: http://localhost:3003/f/keFtrRVzfow

### Basic Flow Test
1. ✅ Open the URL - see loading state, then first question
2. ✅ Check progress bar at top (thin line)
3. ✅ See question number "1 → 5" 
4. ✅ Type an email address
5. ✅ Press **Enter** - see smooth slide to next question
6. ✅ Click a star rating - **auto-advances** after 300ms
7. ✅ Press **Arrow Up** - goes back with reverse animation
8. ✅ Press **Arrow Down** - goes forward again
9. ✅ Complete remaining questions
10. ✅ See animated thank-you screen

---

## 🧪 Comprehensive Test Suite

### Test 1: Loading & Empty States

#### Test 1.1: Valid Published Form
```
URL: http://localhost:3003/f/keFtrRVzfow
Expected: 
  ✓ Shows "Loading form..." briefly
  ✓ Then shows first question
  ✓ Progress bar appears at top
```

#### Test 1.2: Invalid Slug
```
URL: http://localhost:3003/f/invalid-slug-12345
Expected:
  ✓ Shows "Loading form..." briefly
  ✓ Then shows "Form not found" screen with:
    - 🔍 search icon with spring animation
    - "Form not found" heading
    - Helpful description
```

#### Test 1.3: Unpublished Form
```
URL: http://localhost:3003/f/unpublished-form-slug
Expected:
  ✓ Same as Test 1.2 (form not found)
  ✓ Backend only returns published forms
```

---

### Test 2: Keyboard Navigation

#### Test 2.1: Enter Key (Short Text)
```
Question Type: short_text or email or number
Steps:
  1. Type an answer
  2. Press Enter (without Shift)
Expected:
  ✓ Advances to next question
  ✓ Smooth forward slide animation
  ✓ Progress bar updates
```

#### Test 2.2: Shift+Enter (Long Text) ⭐ NEW
```
Question Type: long_text
Steps:
  1. Type some text
  2. Press Shift+Enter
  3. Press Shift+Enter again
  4. Press plain Enter
Expected:
  ✓ Shift+Enter creates newlines (doesn't advance)
  ✓ Plain Enter advances to next question
  ✓ Hint text shows "Shift+Enter for new line, Enter to continue"
  ✓ Textarea shows multiple lines
```

#### Test 2.3: Arrow Keys ⭐ ENHANCED
```
Steps:
  1. Answer first question, advance to second
  2. Press Arrow Up
  3. Press Arrow Down
  4. Repeat multiple times
Expected:
  ✓ Arrow Up goes back with LEFT slide animation
  ✓ Arrow Down advances with RIGHT slide animation
  ✓ Direction matches visual flow
  ✓ Current answer preserved when going back
```

---

### Test 3: Question Types

#### Test 3.1: Short Text
```
Expected:
  ✓ Large 2xl font underline input
  ✓ Placeholder: "Type your answer here..."
  ✓ Auto-focus on appear
  ✓ Enter to advance
  ✓ Hint: "press Enter ↵"
```

#### Test 3.2: Long Text
```
Expected:
  ✓ Multi-line textarea (6 rows)
  ✓ Placeholder includes "(Shift+Enter for new line)"
  ✓ Border on all sides
  ✓ Shift+Enter adds newlines
  ✓ Plain Enter advances
  ✓ Hint: "Shift+Enter for new line, Enter to continue"
```

#### Test 3.3: Email
```
Expected:
  ✓ Large 2xl font underline input
  ✓ Placeholder: "name@example.com"
  ✓ Type invalid email (e.g., "test")
  ✓ Press Enter
  ✓ See error: "Please enter a valid email address"
  ✓ Error has warning icon and red styling
  ✓ Cannot advance until fixed
```

#### Test 3.4: Number
```
Expected:
  ✓ Large 2xl font underline input
  ✓ Shows min/max hint below (if set)
  ✓ Type number below min
  ✓ Press Enter
  ✓ See error: "Number must be at least [min]"
  ✓ Type valid number, advances
```

#### Test 3.5: Multiple Choice
```
Expected:
  ✓ Large option cards with radio buttons
  ✓ Click an option
  ✓ Radio fills, card border darkens
  ✓ Auto-advances after 300ms ⏱️
  ✓ Smooth transition
  ✓ Can change selection before auto-advance
```

#### Test 3.6: Dropdown
```
Expected:
  ✓ Large select menu
  ✓ Placeholder: "Select an option..." (disabled)
  ✓ Hover shows border darkening
  ✓ Select an option
  ✓ Does NOT auto-advance (manual OK/Enter)
  ✓ Enter key advances after selection
```

#### Test 3.7: Yes/No
```
Expected:
  ✓ Two large equal-width buttons
  ✓ Click "Yes" or "No"
  ✓ Button fills with dark background
  ✓ Auto-advances after 300ms ⏱️
  ✓ Can change selection quickly
```

#### Test 3.8: Rating
```
Expected:
  ✓ Row of star emojis (⭐)
  ✓ Center-aligned
  ✓ Hover shows scale effect
  ✓ Click a star
  ✓ Stars up to selection fill (opacity 100%)
  ✓ Stars after selection dim (opacity 30%)
  ✓ Auto-advances after 300ms ⏱️
  ✓ Min/max labels below (e.g., "1" and "5")
```

---

### Test 4: Validation

#### Test 4.1: Required Field
```
Setup: Question with required=true
Steps:
  1. Leave field empty
  2. Press Enter or click OK
Expected:
  ✓ Error: "This field is required"
  ✓ Red background with left border
  ✓ Warning icon visible
  ✓ Cannot advance
  ✓ Fill field, error clears on next Enter
```

#### Test 4.2: Email Validation
```
Steps:
  1. Type: "invalidemail"
  2. Press Enter
Expected:
  ✓ Error: "Please enter a valid email address"
  ✓ Type: "test@example.com"
  ✓ Error clears, advances
```

#### Test 4.3: Number Bounds
```
Setup: Number question with min=1, max=10
Steps:
  1. Type: 0
  2. Press Enter
Expected:
  ✓ Error: "Number must be at least 1"
  
Steps:
  1. Type: 11
  2. Press Enter
Expected:
  ✓ Error: "Number must be at most 10"

Steps:
  1. Type: 5
  2. Press Enter
Expected:
  ✓ No error, advances
```

#### Test 4.4: Error Clears on Navigation
```
Steps:
  1. Trigger validation error
  2. Press Arrow Up (go back)
Expected:
  ✓ Error clears
  ✓ Previous question shows
  
Steps:
  1. Press Arrow Down (go forward again)
Expected:
  ✓ Returns to question
  ✓ No error showing yet
  ✓ Can fix and continue
```

---

### Test 5: Progress Indicator

#### Test 5.1: Progress Bar
```
Expected:
  ✓ Thin bar at very top of screen
  ✓ Starts at 0% width
  ✓ Animates smoothly as you progress
  ✓ Shows 20% on question 1/5
  ✓ Shows 40% on question 2/5
  ✓ Shows 100% on question 5/5
  ✓ Smooth 400ms animation
```

#### Test 5.2: Question Counter
```
Expected:
  ✓ Shows "1 → 5" on first question
  ✓ Shows "2 → 5" on second question
  ✓ Shows "5 → 5" on last question
  ✓ Format: [current] → [total]
```

#### Test 5.3: Required Indicator
```
Expected:
  ✓ Red asterisk (*) shown next to counter if required
  ✓ Only on required questions
  ✓ Not shown on optional questions
```

---

### Test 6: Animations ⭐ ENHANCED

#### Test 6.1: Forward Transition
```
Steps:
  1. Answer question
  2. Press Enter or click OK
Expected:
  ✓ Current question slides out to LEFT
  ✓ Next question slides in from RIGHT
  ✓ Smooth 300ms transition
  ✓ No overlap or flicker
```

#### Test 6.2: Backward Transition
```
Steps:
  1. Be on question 2+
  2. Press Arrow Up or click Back
Expected:
  ✓ Current question slides out to RIGHT
  ✓ Previous question slides in from LEFT
  ✓ Smooth 300ms transition
  ✓ Feels like rewinding
```

#### Test 6.3: Thank-You Animation
```
Steps:
  1. Complete all questions
  2. Submit on last question
Expected:
  ✓ Screen fades/scales in
  ✓ Checkmark bounces with spring (delay 200ms)
  ✓ Heading fades up (delay 300ms)
  ✓ Message fades up (delay 400ms)
  ✓ Final text fades in (delay 500ms)
  ✓ Staggered, polished feel
```

#### Test 6.4: Error Animation
```
Steps:
  1. Trigger validation error
Expected:
  ✓ Error message fades and slides down
  ✓ Appears smoothly, not jarring
```

---

### Test 7: Form Submission

#### Test 7.1: Successful Submit
```
Steps:
  1. Complete all questions with valid answers
  2. Click Submit or press Enter on last question
Expected:
  ✓ Button shows "Submitting..."
  ✓ Button disabled during submit
  ✓ POST to /api/public/forms/{slug}/responses
  ✓ Request body: { answers: [{ question_id, value_text }] }
  ✓ On success: animated thank-you screen
  ✓ No way to navigate away from thank-you
```

#### Test 7.2: Server Validation Error
```
Setup: Manually trigger server error (disconnect backend)
Steps:
  1. Complete form
  2. Submit
Expected:
  ✓ Error message displays
  ✓ Error: "Failed to submit form. Please try again."
  ✓ Still on last question
  ✓ Can try to submit again
```

---

### Test 8: Edge Cases

#### Test 8.1: Empty Optional Field
```
Setup: Optional question (required=false)
Steps:
  1. Leave field empty
  2. Press Enter
Expected:
  ✓ No validation error
  ✓ Advances to next question
  ✓ Empty answer submitted (null or "")
```

#### Test 8.2: Back on First Question
```
Steps:
  1. Be on first question (index 0)
  2. Press Arrow Up
Expected:
  ✓ Nothing happens (already at start)
  ✓ Back button not visible
```

#### Test 8.3: Form with One Question
```
Setup: Form with only 1 question
Expected:
  ✓ Shows "1 → 1"
  ✓ Progress bar at 100%
  ✓ Submit button (not OK)
  ✓ No back button
```

#### Test 8.4: Rapid Navigation
```
Steps:
  1. Quickly press Arrow Down multiple times
  2. Quickly press Arrow Up multiple times
Expected:
  ✓ Smooth transitions
  ✓ No animation overlap
  ✓ No state bugs
  ✓ Current values preserved
```

#### Test 8.5: Change Answer and Go Back
```
Steps:
  1. Answer question 1: "First answer"
  2. Advance to question 2
  3. Go back to question 1
  4. Change to: "Updated answer"
  5. Advance to question 2
  6. Complete form and submit
Expected:
  ✓ Answer saved as "Updated answer"
  ✓ Not "First answer"
  ✓ Latest value always used
```

---

### Test 9: Accessibility

#### Test 9.1: Keyboard-Only Navigation
```
Steps:
  1. Use only keyboard (no mouse)
  2. Tab through elements
  3. Use Enter/Arrow keys to navigate
  4. Complete entire form
Expected:
  ✓ All inputs accessible via keyboard
  ✓ Focus visible on inputs
  ✓ Can navigate entire form
  ✓ Can submit without mouse
```

#### Test 9.2: Auto-Focus
```
Expected:
  ✓ Input auto-focuses when question appears
  ✓ Can start typing immediately
  ✓ No need to click input first
```

---

### Test 10: Mobile/Responsive

#### Test 10.1: Mobile View
```
Steps:
  1. Resize browser to mobile width (375px)
  2. Navigate through form
Expected:
  ✓ Layout remains readable
  ✓ Text doesn't overflow
  ✓ Buttons remain tappable (min 44px)
  ✓ Full-screen experience maintained
```

#### Test 10.2: Touch Interactions
```
Steps:
  1. Use touch/tap instead of click
  2. Test all question types
Expected:
  ✓ All clickable elements respond to tap
  ✓ No hover-only interactions
  ✓ Auto-advance works with tap
```

---

## 🎯 Critical Path Test (Must Pass)

This is the minimal test that must pass for the feature to be considered complete:

### Setup
- Backend running: `http://localhost:8000`
- Frontend running: `http://localhost:3003`
- Published form exists with slug: `keFtrRVzfow`

### Steps
1. ✅ Open: `http://localhost:3003/f/keFtrRVzfow`
2. ✅ Verify: First question appears with progress bar
3. ✅ Action: Type email "test@example.com", press Enter
4. ✅ Verify: Slides to question 2 (smooth RIGHT animation)
5. ✅ Action: Click 5 stars
6. ✅ Verify: Auto-advances after 300ms
7. ✅ Action: Press Arrow Up
8. ✅ Verify: Slides back (smooth LEFT animation)
9. ✅ Action: Press Arrow Down
10. ✅ Verify: Slides forward again (smooth RIGHT animation)
11. ✅ Action: Complete remaining questions
12. ✅ Verify: Last question shows "Submit" button
13. ✅ Action: Click Submit
14. ✅ Verify: Animated thank-you screen appears
15. ✅ Verify: "Thank you!" with checkmark animation

### Expected Result
All steps pass without errors or visual glitches.

---

## 🐛 Known Issues / Limitations

None currently identified. If you find issues during testing:

1. Check browser console for errors
2. Verify backend is running and accessible
3. Ensure form is published (status='published')
4. Test in Chrome (primary support)

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Critical Path: [ ] Pass [ ] Fail
Loading States: [ ] Pass [ ] Fail
Keyboard Nav: [ ] Pass [ ] Fail
Question Types: [ ] Pass [ ] Fail
Validation: [ ] Pass [ ] Fail
Progress Indicator: [ ] Pass [ ] Fail
Animations: [ ] Pass [ ] Fail
Form Submission: [ ] Pass [ ] Fail
Edge Cases: [ ] Pass [ ] Fail
Accessibility: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎬 Demo Script

Use this script for a polished 2-minute demo:

1. **Open form** - "This is the public respondent experience"
2. **Point out progress bar** - "Shows completion status"
3. **Type email** - "Inputs are large and focused"
4. **Press Enter** - "Smooth transition to next question"
5. **Click stars** - "Rating auto-advances for fluid flow"
6. **Press Arrow Up** - "Can navigate back with reverse animation"
7. **Test validation** - "Try invalid input, see inline error"
8. **Complete form** - "Keyboard shortcuts throughout"
9. **Submit** - "Animated thank-you screen on completion"

---

**Testing Status**: Ready for manual testing
**Last Updated**: Current session
**Next Steps**: Run critical path test, report any issues
