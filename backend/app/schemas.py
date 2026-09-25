"""
Pydantic v2 schemas for request/response validation.
Separate create/update/read models for each entity.
"""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


# ============================================================================
# Question Option Schemas
# ============================================================================

class QuestionOptionBase(BaseModel):
    label: str
    order_index: int


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionRead(QuestionOptionBase):
    id: int
    question_id: int
    
    model_config = {"from_attributes": True}


# ============================================================================
# Question Schemas
# ============================================================================

class QuestionBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    order_index: int
    settings_json: Optional[dict] = None


class QuestionCreate(QuestionBase):
    # Options included when creating multiple_choice or dropdown questions
    options: Optional[List[QuestionOptionCreate]] = None


class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    order_index: Optional[int] = None
    settings_json: Optional[dict] = None
    # Options can be updated as well
    options: Optional[List[QuestionOptionCreate]] = None


class QuestionRead(QuestionBase):
    id: int
    form_id: int
    options: List[QuestionOptionRead] = []
    
    model_config = {"from_attributes": True}


# ============================================================================
# Form Schemas
# ============================================================================

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    theme_json: Optional[dict] = None


class FormCreate(FormBase):
    pass


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme_json: Optional[dict] = None


class FormRead(FormBase):
    id: int
    status: str
    share_slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Include questions when returning full form details
    questions: List[QuestionRead] = []
    
    model_config = {"from_attributes": True}


class FormListItem(BaseModel):
    """
    Lightweight form representation for listing (without full questions).
    """
    id: int
    title: str
    description: Optional[str] = None
    status: str
    share_slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Response count (computed, not stored)
    response_count: int = 0
    
    model_config = {"from_attributes": True}


# ============================================================================
# Answer Schemas
# ============================================================================

class AnswerBase(BaseModel):
    question_id: int
    value_text: Optional[str] = None
    value_json: Optional[dict] = None


class AnswerCreate(AnswerBase):
    pass


class AnswerRead(AnswerBase):
    id: int
    response_id: int
    
    model_config = {"from_attributes": True}


# ============================================================================
# Response Schemas
# ============================================================================

class ResponseCreate(BaseModel):
    # List of answers submitted by the respondent
    answers: List[AnswerCreate]
    completed: bool = True


class ResponseRead(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    completed: bool
    started_at: Optional[datetime] = None
    answers: List[AnswerRead] = []
    
    model_config = {"from_attributes": True}


class ResponseListItem(BaseModel):
    """
    Lightweight response representation for listing.
    """
    id: int
    form_id: int
    submitted_at: datetime
    completed: bool
    
    model_config = {"from_attributes": True}


# ============================================================================
# Utility Schemas
# ============================================================================

class ReorderQuestionsRequest(BaseModel):
    """
    Request body for reordering questions.
    Array of question IDs in the desired order.
    """
    question_ids: List[int]


class FormStatsRead(BaseModel):
    """
    Statistics for a form's responses.
    Per-question breakdown of answer counts.
    """
    total_responses: int
    completed_responses: int
    question_stats: List[dict] = []
    
    model_config = {"from_attributes": True}
