"""
Creator-side API endpoints for viewing responses and statistics.
Used by the form creator to view and analyze responses.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict

from app.db import get_db
from app.models import Form, Question, Response, Answer
from app.schemas import ResponseRead, ResponseListItem, FormStatsRead

router = APIRouter()


# ============================================================================
# Helper Functions
# ============================================================================

def get_form_or_404(db: Session, form_id: int) -> Form:
    """
    Get a form by ID or raise 404.
    """
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail=f"Form {form_id} not found")
    return form


def get_response_or_404(db: Session, form_id: int, response_id: int) -> Response:
    """
    Get a response by ID, ensuring it belongs to the form, or raise 404.
    """
    response = db.query(Response).filter(
        Response.id == response_id,
        Response.form_id == form_id
    ).first()
    
    if not response:
        raise HTTPException(
            status_code=404,
            detail=f"Response {response_id} not found in form {form_id}"
        )
    
    return response


# ============================================================================
# Response Viewing Endpoints
# ============================================================================

@router.get("/forms/{form_id}/responses", response_model=List[ResponseListItem])
def list_responses(
    form_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of responses to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max responses to return")
):
    """
    List all responses for a form (paginated).
    Returns lightweight response data without full answer details.
    
    Pagination:
    - skip: number of responses to skip (default 0)
    - limit: max responses to return (default 50, max 100)
    """
    # Verify form exists
    form = get_form_or_404(db, form_id)
    
    # Get responses with pagination, ordered by submission time (newest first)
    responses = db.query(Response).filter(
        Response.form_id == form_id
    ).order_by(
        Response.submitted_at.desc()
    ).offset(skip).limit(limit).all()
    
    # Convert to lightweight list items
    result = [
        ResponseListItem(
            id=r.id,
            form_id=r.form_id,
            submitted_at=r.submitted_at,
            completed=r.completed
        )
        for r in responses
    ]
    
    return result


@router.get("/forms/{form_id}/responses/{response_id}", response_model=ResponseRead)
def get_response_detail(
    form_id: int,
    response_id: int,
    db: Session = Depends(get_db)
):
    """
    Get full details of a single response, including all answers.
    """
    response = get_response_or_404(db, form_id, response_id)
    
    # SQLAlchemy will automatically load the answers relationship
    return response


# ============================================================================
# Statistics Endpoint
# ============================================================================

@router.get("/forms/{form_id}/stats", response_model=FormStatsRead)
def get_form_statistics(form_id: int, db: Session = Depends(get_db)):
    """
    Get response statistics for a form.
    
    Returns per-question aggregates:
    - For choice questions (multiple_choice, dropdown, yes_no): count per option
    - For rating questions: count per rating value
    - For open text questions (short_text, long_text, email, number): total response count
    
    Per the "Basic summary stats" requirement in product.md.
    """
    # Verify form exists
    form = get_form_or_404(db, form_id)
    
    # Get total response counts
    total_responses = db.query(Response).filter(Response.form_id == form_id).count()
    completed_responses = db.query(Response).filter(
        Response.form_id == form_id,
        Response.completed == True
    ).count()
    
    # Get all questions for this form
    questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index).all()
    
    # Build statistics for each question
    question_stats = []
    
    for question in questions:
        stat = {
            "question_id": question.id,
            "question_type": question.type,
            "question_title": question.title,
            "total_answers": 0
        }
        
        # Get all answers for this question
        answers = db.query(Answer).filter(Answer.question_id == question.id).all()
        stat["total_answers"] = len(answers)
        
        # Type-specific aggregation
        if question.type in ["multiple_choice", "dropdown", "yes_no"]:
            # Count answers per option/choice
            value_counts = defaultdict(int)
            for answer in answers:
                if answer.value_text:
                    value_counts[answer.value_text] += 1
            
            stat["value_distribution"] = dict(value_counts)
            
            # For multiple_choice/dropdown, include all options (even with 0 count)
            if question.type in ["multiple_choice", "dropdown"]:
                for option in question.options:
                    if option.label not in stat["value_distribution"]:
                        stat["value_distribution"][option.label] = 0
        
        elif question.type == "rating":
            # Count answers per rating value
            rating_counts = defaultdict(int)
            for answer in answers:
                if answer.value_text:
                    try:
                        rating = int(answer.value_text)
                        rating_counts[str(rating)] += 1
                    except ValueError:
                        pass
            
            stat["value_distribution"] = dict(rating_counts)
            
            # Fill in missing ratings with 0
            max_rating = question.settings_json.get("max", 5) if question.settings_json else 5
            for i in range(1, max_rating + 1):
                if str(i) not in stat["value_distribution"]:
                    stat["value_distribution"][str(i)] = 0
        
        elif question.type in ["short_text", "long_text", "email", "number"]:
            # For open text questions, just report the count
            # Could add more analysis here (word cloud, average length, etc.)
            stat["response_count"] = len(answers)
        
        question_stats.append(stat)
    
    return FormStatsRead(
        total_responses=total_responses,
        completed_responses=completed_responses,
        question_stats=question_stats
    )
