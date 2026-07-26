"""
FastAPI routes for meeting CRUD operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import Optional, List

from app.database import get_db
from app.models import Meeting, Speaker, TranscriptSegment, Summary, ActionItem, KeyTopic
from app.schemas import (
    MeetingCreate,
    MeetingUpdate,
    MeetingListResponse,
    MeetingDetailResponse,
    MeetingFullResponse,
    MeetingFullCreate,
    SpeakerCreate,
    SummaryCreate,
    TranscriptSegmentCreate,
    ActionItemCreate,
    KeyTopicCreate,
)

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _compute_duration_and_participants(db: Session, meeting: Meeting):
    """
    Compute duration_seconds (from max end_time of transcript) and
    participants_count (from speaker count), then update meeting.
    """
    segments = db.query(TranscriptSegment).filter(TranscriptSegment.meeting_id == meeting.id).all()
    speakers = db.query(Speaker).filter(Speaker.meeting_id == meeting.id).all()
    
    if segments:
        max_end = max(seg.end_time_seconds for seg in segments)
        meeting.duration_seconds = int(max_end)
    else:
        meeting.duration_seconds = 0
    
    meeting.participants_count = len(speakers)
    db.commit()


@router.get("", response_model=List[MeetingListResponse])
def list_meetings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    sort_by: str = "recent"
):
    """
    List all meetings. Supports pagination, search, and sorting.
    
    - search: Filter by title or description
    - sort_by: "recent" (newest first) or "oldest" (oldest first)
    """
    query = db.query(Meeting)
    
    if search:
        query = query.filter(
            (Meeting.title.ilike(f"%{search}%")) |
            (Meeting.description.ilike(f"%{search}%"))
        )
    
    if sort_by == "oldest":
        query = query.order_by(Meeting.date_recorded.asc())
    else:  # default: recent
        query = query.order_by(Meeting.date_recorded.desc())
    
    meetings = query.offset(skip).limit(limit).all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """
    Get a meeting with all related data: speakers, transcript, summary, action items, key topics.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Ensure computed fields are up-to-date
    _compute_duration_and_participants(db, meeting)
    
    return meeting


@router.post("", response_model=MeetingFullResponse, status_code=201)
def create_meeting(
    meeting_create: MeetingCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new meeting.
    Caller should then POST speakers, transcript segments, summary, etc. separately,
    or provide them all at once (see POST /meetings/batch for that use case).
    """
    meeting = Meeting(
        title=meeting_create.title,
        description=meeting_create.description,
        date_recorded=meeting_create.date_recorded,
        thumbnail_url=meeting_create.thumbnail_url,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    
    _compute_duration_and_participants(db, meeting)
    return meeting


@router.put("/{meeting_id}", response_model=MeetingDetailResponse)
def update_meeting(
    meeting_id: int,
    meeting_update: MeetingUpdate,
    db: Session = Depends(get_db)
):
    """
    Update meeting metadata (title, description).
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if meeting_update.title is not None:
        meeting.title = meeting_update.title
    if meeting_update.description is not None:
        meeting.description = meeting_update.description
    
    meeting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(meeting)
    
    return meeting


@router.post("/full", response_model=MeetingFullResponse, status_code=201)
def create_meeting_full(
    meeting_full_create: MeetingFullCreate,
    db: Session = Depends(get_db)
):
    """
    Create a complete meeting with all related data in one transaction.
    
    Accepts:
    - Meeting metadata (title, description, date_recorded, thumbnail_url)
    - List of speakers (name, email, avatar_url)
    - List of transcript segments (speaker_name, text, timestamps, sequence_order)
    - Optional summary (overview)
    - Optional action items (description, assigned_to, completed)
    - Optional key topics (title, description, timestamp_seconds, sequence_order)
    
    Returns the full meeting object with all nested data.
    """
    try:
        # Create meeting
        meeting = Meeting(
            title=meeting_full_create.title,
            description=meeting_full_create.description,
            date_recorded=meeting_full_create.date_recorded,
            thumbnail_url=meeting_full_create.thumbnail_url,
        )
        db.add(meeting)
        db.flush()  # Get the meeting ID without committing
        
        # Create speakers and map by name for transcript segment linking
        speaker_map = {}  # {speaker_name -> speaker_id}
        for speaker_data in meeting_full_create.speakers:
            speaker = Speaker(
                meeting_id=meeting.id,
                name=speaker_data.name,
                email=speaker_data.email,
                avatar_url=speaker_data.avatar_url,
            )
            db.add(speaker)
            db.flush()
            speaker_map[speaker_data.name] = speaker.id
        
        # Create transcript segments (link to speakers by name)
        for segment_data in meeting_full_create.transcript_segments:
            if segment_data.speaker_name not in speaker_map:
                db.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"Speaker '{segment_data.speaker_name}' not found in speakers list"
                )
            
            segment = TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=speaker_map[segment_data.speaker_name],
                text=segment_data.text,
                start_time_seconds=segment_data.start_time_seconds,
                end_time_seconds=segment_data.end_time_seconds,
                sequence_order=segment_data.sequence_order,
            )
            db.add(segment)
        
        # Create summary if provided
        if meeting_full_create.summary:
            summary = Summary(
                meeting_id=meeting.id,
                overview=meeting_full_create.summary.overview,
            )
            db.add(summary)
        
        # Create action items if provided
        if meeting_full_create.action_items:
            for item_data in meeting_full_create.action_items:
                item = ActionItem(
                    meeting_id=meeting.id,
                    description=item_data.description,
                    assigned_to=item_data.assigned_to,
                    completed=item_data.completed,
                )
                db.add(item)
        
        # Create key topics if provided
        if meeting_full_create.key_topics:
            for topic_data in meeting_full_create.key_topics:
                topic = KeyTopic(
                    meeting_id=meeting.id,
                    title=topic_data.title,
                    description=topic_data.description,
                    timestamp_seconds=topic_data.timestamp_seconds,
                    sequence_order=topic_data.sequence_order,
                )
                db.add(topic)
        
        # Commit all changes
        db.commit()
        db.refresh(meeting)
        
        # Compute duration and participants from the data we just created
        _compute_duration_and_participants(db, meeting)
        
        return meeting
    
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """
    Delete a meeting (cascades to all related data: speakers, transcript, summary, etc.).
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
    return None
