"""
SQLAlchemy ORM models for Fireflies.ai clone.
Maps directly to the database schema.
"""

from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, TIMESTAMP
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    """Current logged-in user. Single hardcoded row."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)


class Meeting(Base):
    """A recorded or uploaded meeting."""
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date_recorded = Column(TIMESTAMP, nullable=False)
    # duration_seconds and participants_count are computed server-side from related data
    # (transcript segments and speakers respectively) and kept in sync via routes
    duration_seconds = Column(Integer, nullable=True)
    participants_count = Column(Integer, default=0)
    thumbnail_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    speakers = relationship("Speaker", back_populates="meeting", cascade="all, delete-orphan")
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    summary = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    key_topics = relationship("KeyTopic", back_populates="meeting", cascade="all, delete-orphan")


class Speaker(Base):
    """A participant in a meeting."""
    __tablename__ = "speakers"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="speakers")
    transcript_segments = relationship("TranscriptSegment", back_populates="speaker")


class TranscriptSegment(Base):
    """One line/segment of a transcript with speaker, timestamps, and text."""
    __tablename__ = "transcript_segments"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    speaker_id = Column(Integer, ForeignKey("speakers.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    start_time_seconds = Column(Float, nullable=False)
    end_time_seconds = Column(Float, nullable=False)
    sequence_order = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="transcript_segments")
    speaker = relationship("Speaker", back_populates="transcript_segments")


class Summary(Base):
    """AI-generated summary for a meeting (one-to-one with meeting)."""
    __tablename__ = "summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    overview = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="summary")


class ActionItem(Base):
    """An action item extracted from a meeting."""
    __tablename__ = "action_items"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(String(255), nullable=True)  # speaker name or null
    description = Column(Text, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")


class KeyTopic(Base):
    """A key topic or chapter mentioned in a meeting."""
    __tablename__ = "key_topics"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    timestamp_seconds = Column(Float, nullable=True)
    sequence_order = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="key_topics")
