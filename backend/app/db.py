"""
Database configuration and session management.
SQLite for simplicity (production would use PostgreSQL).
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file path
# In production, can override via DATABASE_PATH environment variable
# Example: DATABASE_PATH=/opt/render/project/data/typeform.db
database_path = os.getenv("DATABASE_PATH", "./typeform.db")
DATABASE_URL = f"sqlite:///{database_path}"

# Create engine with check_same_thread=False for SQLite
# This allows the same connection to be used across threads (needed for FastAPI)
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)


# Enable foreign key constraints in SQLite (required for CASCADE DELETE)
# SQLite disables foreign keys by default; this ensures cascade deletes work at DB level
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


# Session factory for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    Dependency function for FastAPI routes.
    Creates a new database session for each request and closes it after.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
