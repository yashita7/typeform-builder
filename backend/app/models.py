"""
SQLAlchemy models implementing the exact schema from structure.md.
All tables and columns match the specification.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db import Base


class Form(Base):
    """
    Forms table - represents a form created by the user.
    """
    __tablename__ = "forms"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    # Status: 'draft' or 'published'
    status = Column(String, nullable=False, default="draft")
    # Unique slug for public sharing (only set when published)
    share_slug = Column(String, unique=True, nullable=True, index=True)
    # JSON field for theme customization (colors, fonts, background)
    theme_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    """
    Questions table - individual questions within a form.
    Supports 8 types: short_text, long_text, multiple_choice, dropdown, 
    email, number, yes_no, rating.
    """
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    # Question type (see types above)
    type = Column(String, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False)
    # Order within the form (0-indexed)
    order_index = Column(Integer, nullable=False)
    # JSON field for type-specific settings (e.g., rating max, number min/max)
    settings_json = Column(JSON, nullable=True)
    
    # Relationships
    form = relationship("Form", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    """
    Question options table - choices for multiple_choice and dropdown questions.
    Only used for question types that have predefined options.
    """
    __tablename__ = "question_options"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    label = Column(String, nullable=False)
    # Order within the question's options (0-indexed)
    order_index = Column(Integer, nullable=False)
    
    # Relationships
    question = relationship("Question", back_populates="options")


class Response(Base):
    """
    Responses table - a respondent's submission of a form.
    """
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    # Whether the response was fully completed
    completed = Column(Boolean, default=True)
    # Reserved for partial-completion tracking (bonus feature)
    started_at = Column(DateTime, nullable=True)
    
    # Relationships
    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    """
    Answers table - individual answers within a response.
    Stores answer data in value_text (for simple answers) or value_json (for complex).
    """
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    # Text-based answer (for most question types)
    value_text = Column(Text, nullable=True)
    # JSON-based answer (for future multi-select or complex data)
    value_json = Column(JSON, nullable=True)
    
    # Relationships
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
