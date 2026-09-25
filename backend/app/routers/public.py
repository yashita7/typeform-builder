"""
Public API endpoints for the respondent flow.
No authentication required - these are used by the public form-fill experience.
"""
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Form, Question, Answer, Response
from app.schemas import FormRead, ResponseCreate

router = APIRouter()


# ============================================================================
# Validation Helpers
# ============================================================================

def validate_email(value: str) -> bool:
    """
    Validate email format using a simple regex.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, value))


def validate_answer(question: Question, value: str) -> tuple[bool, str]:
    """
    Validate an answer based on question type and settings.
    Returns (is_valid, error_message).
    
    Validation rules per product.md:
    - required: must be non-empty
    - email: must match email regex
    - number: must be numeric and within bounds (if settings_json has min/max)
    - yes_no: must be 'Yes' or 'No'
    - rating: must be numeric and within range (1 to settings_json.max)
    - multiple_choice/dropdown: must match one of the option labels
    """
    # Required field validation
    if question.required and (not value or value.strip() == ""):
        return False, f"Question '{question.title}' is required"
    
    # If not required and empty, it's valid
    if not value or value.strip() == "":
        return True, ""
    
    # Type-specific validation
    if question.type == "email":
        if not validate_email(value):
            return False, f"Invalid email format for '{question.title}'"
    
    elif question.type == "number":
        try:
            num_value = float(value)
            # Check bounds if specified in settings_json
            if question.settings_json:
                min_val = question.settings_json.get("min")
                max_val = question.settings_json.get("max")
                if min_val is not None and num_value < min_val:
                    return False, f"Value must be at least {min_val}"
                if max_val is not None and num_value > max_val:
                    return False, f"Value must be at most {max_val}"
        except ValueError:
            return False, f"'{question.title}' must be a number"
    
    elif question.type == "yes_no":
        if value.lower() not in ["yes", "no"]:
            return False, f"'{question.title}' must be 'yes' or 'no'"
    
    elif question.type == "rating":
        try:
            rating_value = int(value)
            max_rating = question.settings_json.get("max", 5) if question.settings_json else 5
            if rating_value < 1 or rating_value > max_rating:
                return False, f"Rating must be between 1 and {max_rating}"
        except ValueError:
            return False, f"Rating must be a number"
    
    elif question.type in ["multiple_choice", "dropdown"]:
        # Validate that the value matches one of the option labels
        valid_options = [opt.label for opt in question.options]
        if value not in valid_options:
            return False, f"Invalid option for '{question.title}'"
    
    return True, ""


# ============================================================================
# Public Endpoints
# ============================================================================

@router.get("/forms/{slug}", response_model=FormRead)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    """
    Get a published form by its share slug.
    Only returns published forms with questions ordered by order_index.
    Does not expose internal metadata like response counts.
    """
    # Find form by slug (must be published)
    form = db.query(Form).filter(
        Form.share_slug == slug,
        Form.status == "published"
    ).first()
    
    if not form:
        raise HTTPException(
            status_code=404,
            detail=f"Published form with slug '{slug}' not found"
        )
    
    # Ensure questions are ordered by order_index
    form.questions = sorted(form.questions, key=lambda q: q.order_index)
    
    # Ensure options within each question are also ordered
    for question in form.questions:
        question.options = sorted(question.options, key=lambda o: o.order_index)
    
    return form


@router.post("/forms/{slug}/responses")
def submit_response(
    slug: str,
    response_data: ResponseCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a response to a published form.
    Validates all answers server-side before persisting.
    
    Validation rules (per product.md):
    - Required fields must be non-empty
    - Email format validation
    - Number bounds validation (from settings_json)
    - Yes/No must be exactly 'Yes' or 'No'
    - Rating must be within range
    - Multiple choice/dropdown must match valid options
    
    Persists response + all answers in a single transaction.
    """
    # Get the form (must be published)
    form = db.query(Form).filter(
        Form.share_slug == slug,
        Form.status == "published"
    ).first()
    
    if not form:
        raise HTTPException(
            status_code=404,
            detail=f"Published form with slug '{slug}' not found"
        )
    
    # Build a map of questions for validation
    questions = db.query(Question).filter(Question.form_id == form.id).all()
    question_map = {q.id: q for q in questions}
    
    # Validate all answers before persisting anything
    validation_errors = []
    
    for answer_data in response_data.answers:
        question = question_map.get(answer_data.question_id)
        
        if not question:
            validation_errors.append(
                f"Question ID {answer_data.question_id} does not exist in this form"
            )
            continue
        
        # Use value_text for validation (value_json is for future multi-select)
        value = answer_data.value_text or ""
        is_valid, error_msg = validate_answer(question, value)
        
        if not is_valid:
            validation_errors.append(error_msg)
    
    # Check for missing required questions
    answered_question_ids = {a.question_id for a in response_data.answers}
    for question in questions:
        if question.required and question.id not in answered_question_ids:
            validation_errors.append(f"Question '{question.title}' is required")
    
    # If any validation errors, return 400 with all errors
    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail={"errors": validation_errors}
        )
    
    # All validation passed - persist response and answers in one transaction
    new_response = Response(
        form_id=form.id,
        completed=response_data.completed
    )
    db.add(new_response)
    db.flush()  # Get new_response.id
    
    # Add all answers
    for answer_data in response_data.answers:
        answer = Answer(
            response_id=new_response.id,
            question_id=answer_data.question_id,
            value_text=answer_data.value_text,
            value_json=answer_data.value_json
        )
        db.add(answer)
    
    db.commit()
    db.refresh(new_response)
    
    return {
        "message": "Response submitted successfully",
        "response_id": new_response.id
    }
