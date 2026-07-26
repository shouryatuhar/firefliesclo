"""
FastAPI routes for transcript retrieval and search.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Meeting, TranscriptSegment
from app.schemas import TranscriptSegmentResponse

router = APIRouter(prefix="/api/meetings", tags=["transcripts"])


@router.get("/{meeting_id}/transcript", response_model=List[TranscriptSegmentResponse])
def get_meeting_transcript(
    meeting_id: int,
    db: Session = Depends(get_db),
    search: Optional[str] = None
):
    """
    Get full transcript for a meeting, ordered by sequence_order.
    Optionally filter by search text.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    query = db.query(TranscriptSegment).filter(
        TranscriptSegment.meeting_id == meeting_id
    )
    
    if search:
        query = query.filter(TranscriptSegment.text.ilike(f"%{search}%"))
    
    segments = query.order_by(TranscriptSegment.sequence_order.asc()).all()
    return segments
