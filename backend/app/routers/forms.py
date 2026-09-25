"""
Creator-side API endpoints for forms and questions.
All endpoints assume a single default creator (no authentication).
"""
import secrets
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models import Form, Question, QuestionOption, Response
from app.schemas import (
    FormCreate,
    FormUpdate,
    FormRead,
    FormListItem,
    QuestionCreate,
    QuestionUpdate,
    QuestionRead,
    ReorderQuestionsRequest,
)

router = APIRouter()


# ============================================================================
# Helper Functions
# ============================================================================

def generate_unique_slug(db: Session) -> str:
    """
    Generate a unique URL-safe slug for published forms.
    Keeps trying until we find one that doesn't exist.
    """
    max_attempts = 10
    for _ in range(max_attempts):
        slug = secrets.token_urlsafe(8)
        existing = db.query(Form).filter(Form.share_slug == slug).first()
        if not existing:
            return slug
    
    # Fallback with timestamp if we somehow hit collisions
    import time
    return f"{secrets.token_urlsafe(6)}-{int(time.time())}"


def get_form_or_404(db: Session, form_id: int) -> Form:
    """
    Get a form by ID or raise 404.
    """
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail=f"Form {form_id} not found")
    return form


def get_question_or_404(db: Session, form_id: int, question_id: int) -> Question:
    """
    Get a question by ID, ensuring it belongs to the form, or raise 404.
    """
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.form_id == form_id
    ).first()
    if not question:
        raise HTTPException(
            status_code=404,
            detail=f"Question {question_id} not found in form {form_id}"
        )
    return question


# ============================================================================
# Form CRUD Endpoints
# ============================================================================

@router.get("/forms", response_model=List[FormListItem])
def list_forms(db: Session = Depends(get_db)):
    """
    List all forms with response counts.
    Returns lightweight form data without full question details.
    """
    forms = db.query(Form).order_by(Form.updated_at.desc()).all()
    
    # Build response with computed response_count for each form
    result = []
    for form in forms:
        response_count = db.query(Response).filter(Response.form_id == form.id).count()
        form_item = FormListItem(
            id=form.id,
            title=form.title,
            description=form.description,
            status=form.status,
            share_slug=form.share_slug,
            created_at=form.created_at,
            updated_at=form.updated_at,
            response_count=response_count
        )
        result.append(form_item)
    
    return result


@router.post("/forms", response_model=FormRead)
def create_form(form_data: FormCreate, db: Session = Depends(get_db)):
    """
    Create a new form in draft status.
    Returns the created form with empty questions list.
    """
    new_form = Form(
        title=form_data.title,
        description=form_data.description,
        theme_json=form_data.theme_json,
        status="draft"  # Always starts as draft
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    
    return new_form


@router.get("/forms/{form_id}", response_model=FormRead)
def get_form(form_id: int, db: Session = Depends(get_db)):
    """
    Get a single form with all its questions and options.
    Questions are ordered by order_index.
    """
    form = get_form_or_404(db, form_id)
    
    # Ensure questions are ordered by order_index
    form.questions = sorted(form.questions, key=lambda q: q.order_index)
    
    # Ensure options within each question are also ordered
    for question in form.questions:
        question.options = sorted(question.options, key=lambda o: o.order_index)
    
    return form


@router.patch("/forms/{form_id}", response_model=FormRead)
def update_form(
    form_id: int,
    form_data: FormUpdate,
    db: Session = Depends(get_db)
):
    """
    Update form metadata (title, description, theme).
    Returns the updated form.
    """
    form = get_form_or_404(db, form_id)
    
    # Update only provided fields
    if form_data.title is not None:
        form.title = form_data.title
    if form_data.description is not None:
        form.description = form_data.description
    if form_data.theme_json is not None:
        form.theme_json = form_data.theme_json
    
    db.commit()
    db.refresh(form)
    
    # Ensure questions are ordered
    form.questions = sorted(form.questions, key=lambda q: q.order_index)
    
    return form


@router.delete("/forms/{form_id}")
def delete_form(form_id: int, db: Session = Depends(get_db)):
    """
    Delete a form and all its questions, options, responses, and answers.
    Cascade deletes are configured in models.py relationships and enforced
    by SQLite with PRAGMA foreign_keys=ON (see db.py).
    """
    form = get_form_or_404(db, form_id)
    
    db.delete(form)
    db.commit()
    
    return {"message": f"Form {form_id} deleted successfully"}


@router.post("/forms/{form_id}/duplicate", response_model=FormRead)
def duplicate_form(form_id: int, db: Session = Depends(get_db)):
    """
    Duplicate a form with all its questions and options.
    The duplicated form is always in draft status.
    Does NOT copy responses.
    """
    original_form = get_form_or_404(db, form_id)
    
    # Create new form with same metadata
    new_form = Form(
        title=f"{original_form.title} (Copy)",
        description=original_form.description,
        theme_json=original_form.theme_json,
        status="draft",  # Always draft, even if original was published
        share_slug=None  # No slug until published
    )
    db.add(new_form)
    db.flush()  # Get new_form.id
    
    # Deep copy: duplicate all questions with new IDs
    original_questions = sorted(original_form.questions, key=lambda q: q.order_index)
    for orig_question in original_questions:
        new_question = Question(
            form_id=new_form.id,
            type=orig_question.type,
            title=orig_question.title,
            description=orig_question.description,
            required=orig_question.required,
            order_index=orig_question.order_index,
            settings_json=orig_question.settings_json
        )
        db.add(new_question)
        db.flush()  # Get new_question.id
        
        # Deep copy: duplicate all options with new IDs
        original_options = sorted(orig_question.options, key=lambda o: o.order_index)
        for orig_option in original_options:
            new_option = QuestionOption(
                question_id=new_question.id,
                label=orig_option.label,
                order_index=orig_option.order_index
            )
            db.add(new_option)
    
    db.commit()
    db.refresh(new_form)
    
    # Ensure questions are ordered
    new_form.questions = sorted(new_form.questions, key=lambda q: q.order_index)
    
    return new_form


@router.post("/forms/{form_id}/publish", response_model=FormRead)
def publish_form(form_id: int, db: Session = Depends(get_db)):
    """
    Publish a form, generating a unique share_slug if not already published.
    Idempotent: calling this on an already-published form keeps the existing slug.
    """
    form = get_form_or_404(db, form_id)
    
    # Idempotent: if already published, return as-is without changing slug
    if form.status == "published":
        form.questions = sorted(form.questions, key=lambda q: q.order_index)
        return form
    
    # Generate unique slug and publish
    form.status = "published"
    if not form.share_slug:
        form.share_slug = generate_unique_slug(db)
    
    db.commit()
    db.refresh(form)
    
    # Ensure questions are ordered
    form.questions = sorted(form.questions, key=lambda q: q.order_index)
    
    return form


@router.post("/forms/{form_id}/unpublish", response_model=FormRead)
def unpublish_form(form_id: int, db: Session = Depends(get_db)):
    """
    Unpublish a form, changing status back to 'draft'.
    Keeps the share_slug for potential re-publishing.
    """
    form = get_form_or_404(db, form_id)
    
    form.status = "draft"
    db.commit()
    db.refresh(form)
    
    # Ensure questions are ordered
    form.questions = sorted(form.questions, key=lambda q: q.order_index)
    
    return form


# ============================================================================
# Question Sub-Resource Endpoints
# ============================================================================

# NOTE: The reorder endpoint must come BEFORE the /{question_id} routes
# to avoid "reorder" being interpreted as a question_id

@router.patch("/forms/{form_id}/questions/reorder", response_model=List[QuestionRead])
def reorder_questions(
    form_id: int,
    reorder_data: ReorderQuestionsRequest,
    db: Session = Depends(get_db)
):
    """
    Batch update question order.
    Accepts an array of question IDs in the desired order.
    Validates that all question IDs belong to this form (400 if not).
    """
    # Verify form exists
    form = get_form_or_404(db, form_id)
    
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
    
    # Update order_index for each question
    for new_index, question_id in enumerate(reorder_data.question_ids):
        question = question_map[question_id]
        question.order_index = new_index
    
    db.commit()
    
    # Return all questions in the new order
    result = []
    for question_id in reorder_data.question_ids:
        question = question_map[question_id]
        db.refresh(question)
        # Ensure options are ordered
        question.options = sorted(question.options, key=lambda o: o.order_index)
        result.append(question)
    
    return result


@router.post("/forms/{form_id}/questions", response_model=QuestionRead)
def create_question(
    form_id: int,
    question_data: QuestionCreate,
    db: Session = Depends(get_db)
):
    """
    Add a new question to a form.
    If the question type is multiple_choice or dropdown, options can be included.
    """
    # Verify form exists
    form = get_form_or_404(db, form_id)
    
    # Create the question
    new_question = Question(
        form_id=form_id,
        type=question_data.type,
        title=question_data.title,
        description=question_data.description,
        required=question_data.required,
        order_index=question_data.order_index,
        settings_json=question_data.settings_json
    )
    db.add(new_question)
    db.flush()  # Get new_question.id
    
    # Add options if provided (for multiple_choice/dropdown)
    if question_data.options:
        for option_data in question_data.options:
            option = QuestionOption(
                question_id=new_question.id,
                label=option_data.label,
                order_index=option_data.order_index
            )
            db.add(option)
    
    db.commit()
    db.refresh(new_question)
    
    # Ensure options are ordered
    new_question.options = sorted(new_question.options, key=lambda o: o.order_index)
    
    return new_question


@router.patch("/forms/{form_id}/questions/{question_id}", response_model=QuestionRead)
def update_question(
    form_id: int,
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a question's properties.
    If options are provided, replaces all existing options.
    """
    question = get_question_or_404(db, form_id, question_id)
    
    # Update provided fields
    if question_data.type is not None:
        question.type = question_data.type
    if question_data.title is not None:
        question.title = question_data.title
    if question_data.description is not None:
        question.description = question_data.description
    if question_data.required is not None:
        question.required = question_data.required
    if question_data.order_index is not None:
        question.order_index = question_data.order_index
    if question_data.settings_json is not None:
        question.settings_json = question_data.settings_json
    
    # If options are provided, replace all existing options
    if question_data.options is not None:
        # Delete existing options
        db.query(QuestionOption).filter(
            QuestionOption.question_id == question_id
        ).delete()
        
        # Add new options
        for option_data in question_data.options:
            option = QuestionOption(
                question_id=question_id,
                label=option_data.label,
                order_index=option_data.order_index
            )
            db.add(option)
    
    db.commit()
    db.refresh(question)
    
    # Ensure options are ordered
    question.options = sorted(question.options, key=lambda o: o.order_index)
    
    return question


@router.delete("/forms/{form_id}/questions/{question_id}")
def delete_question(
    form_id: int,
    question_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a question and all its options.
    SQLAlchemy cascade handles option deletion.
    """
    question = get_question_or_404(db, form_id, question_id)
    
    db.delete(question)
    db.commit()
    
    return {"message": f"Question {question_id} deleted successfully"}
