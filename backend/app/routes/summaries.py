"""
FastAPI routes for summary, action items, and key topics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Meeting, Summary, ActionItem, KeyTopic
from app.schemas import (
    SummaryResponse,
    SummaryCreate,
    SummaryUpdate,
    ActionItemResponse,
    ActionItemCreate,
    ActionItemUpdate,
    KeyTopicResponse,
    KeyTopicCreate,
)

router = APIRouter(tags=["summaries", "action-items", "key-topics"])


# ============================================================================
# SUMMARY ENDPOINTS
# ============================================================================

@router.get("/api/meetings/{meeting_id}/summary", response_model=SummaryResponse)
def get_meeting_summary(meeting_id: int, db: Session = Depends(get_db)):
    """
    Get the summary for a meeting. If none exists, return 404.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found for this meeting")
    
    return summary


@router.post("/api/meetings/{meeting_id}/summary", response_model=SummaryResponse, status_code=201)
def create_meeting_summary(
    meeting_id: int,
    summary_create: SummaryCreate,
    db: Session = Depends(get_db)
):
    """
    Create a summary for a meeting.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if summary already exists
    existing = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Summary already exists for this meeting")
    
    summary = Summary(meeting_id=meeting_id, overview=summary_create.overview)
    db.add(summary)
    db.commit()
    db.refresh(summary)
    
    return summary


@router.put("/api/meetings/{meeting_id}/summary", response_model=SummaryResponse)
def update_meeting_summary(
    meeting_id: int,
    summary_update: SummaryUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing summary.
    """
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    summary.overview = summary_update.overview
    summary.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(summary)
    
    return summary


# ============================================================================
# ACTION ITEM ENDPOINTS
# ============================================================================

@router.get("/api/meetings/{meeting_id}/action-items", response_model=list[ActionItemResponse])
def get_meeting_action_items(meeting_id: int, db: Session = Depends(get_db)):
    """
    Get all action items for a meeting.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()
    return items


@router.post("/api/meetings/{meeting_id}/action-items", response_model=ActionItemResponse, status_code=201)
def create_action_item_for_meeting(
    meeting_id: int,
    action_item_create: ActionItemCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new action item for a specific meeting.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    item = ActionItem(
        meeting_id=meeting_id,
        description=action_item_create.description,
        assigned_to=action_item_create.assigned_to,
        completed=action_item_create.completed,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item


@router.put("/api/action-items/{action_item_id}", response_model=ActionItemResponse)
def update_action_item(
    action_item_id: int,
    action_item_update: ActionItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an action item (e.g., mark as completed).
    """
    item = db.query(ActionItem).filter(ActionItem.id == action_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    if action_item_update.description is not None:
        item.description = action_item_update.description
    if action_item_update.assigned_to is not None:
        item.assigned_to = action_item_update.assigned_to
    if action_item_update.completed is not None:
        item.completed = action_item_update.completed
    
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/api/action-items/{action_item_id}", status_code=204)
def delete_action_item(action_item_id: int, db: Session = Depends(get_db)):
    """
    Delete an action item.
    """
    item = db.query(ActionItem).filter(ActionItem.id == action_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    db.delete(item)
    db.commit()
    return None


# ============================================================================
# KEY TOPIC ENDPOINTS
# ============================================================================

@router.get("/api/meetings/{meeting_id}/key-topics", response_model=list[KeyTopicResponse])
def get_meeting_key_topics(meeting_id: int, db: Session = Depends(get_db)):
    """
    Get all key topics for a meeting, ordered by sequence_order.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    topics = db.query(KeyTopic).filter(KeyTopic.meeting_id == meeting_id).order_by(
        KeyTopic.sequence_order.asc()
    ).all()
    return topics


@router.post("/api/meetings/{meeting_id}/key-topics", response_model=KeyTopicResponse, status_code=201)
def create_key_topic(
    meeting_id: int,
    topic_create: KeyTopicCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new key topic for a meeting.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    topic = KeyTopic(
        meeting_id=meeting_id,
        title=topic_create.title,
        description=topic_create.description,
        timestamp_seconds=topic_create.timestamp_seconds,
        sequence_order=topic_create.sequence_order,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    return topic
