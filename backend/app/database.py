"""
Database connection and session management for Fireflies.ai clone.
Uses SQLite with SQLAlchemy ORM.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

# Database URL — use SQLite file-based database
# Default: fireflies.db in the backend root
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fireflies.db")

# Create engine
# echo=True prints all SQL statements to console (useful for debugging, disable in production)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Session:
    """
    Dependency for FastAPI route handlers.
    Yields a database session; FastAPI closes it after the request.
    
    Usage in routes:
        @app.get("/meetings")
        def get_meetings(db: Session = Depends(get_db)):
            return db.query(Meeting).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database: create all tables.
    Call this once at application startup (or in seed script).
    """
    from app.models import Base
    Base.metadata.create_all(bind=engine)


def drop_db():
    """
    Drop all tables. Useful for testing/reset.
    CAUTION: This deletes all data.
    """
    from app.models import Base
    Base.metadata.drop_all(bind=engine)
