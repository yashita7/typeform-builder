"""
FastAPI main application with CORS enabled.
Creates database and seeds sample data on startup.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.seed import seed_database

# Create FastAPI app
app = FastAPI(
    title="Typeform Clone API",
    description="Backend API for Typeform builder clone",
    version="1.0.0"
)

# CORS configuration - allows frontend to make requests
# In production, set CORS_ORIGINS environment variable to your deployed frontend URL
# Example: CORS_ORIGINS=https://your-app.vercel.app
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    # Production: Use environment variable (comma-separated list)
    CORS_ORIGINS = [origin.strip() for origin in cors_origins_env.split(",")]
else:
    # Development: Allow local development servers
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.on_event("startup")
def startup_event():
    """
    Run on application startup.
    Creates all database tables and seeds sample data.
    """
    # Create all tables defined in models.py
    Base.metadata.create_all(bind=engine)
    
    # Seed the database with sample forms and responses
    seed_database()


@app.get("/")
def read_root():
    """
    Health check endpoint.
    """
    return {
        "message": "Typeform Clone API",
        "status": "running",
        "docs": "/docs"
    }


# Include API routers
from app.routers import forms, responses, public

app.include_router(forms.router, prefix="/api", tags=["Forms & Questions"])
app.include_router(responses.router, prefix="/api", tags=["Responses & Stats"])
app.include_router(public.router, prefix="/api/public", tags=["Public (Respondent)"])
