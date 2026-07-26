"""
FastAPI routes for action items CRUD.
(This can also be combined with summaries.py; kept separate here for clarity.)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Meeting, ActionItem
from app.schemas import ActionItemResponse, ActionItemCreate, ActionItemUpdate

router = APIRouter(prefix="/api", tags=["action-items"])


@router.get("/meetings/{meeting_id}/action-items", response_model=list[ActionItemResponse])
def get_meeting_action_items(meeting_id: int, db: Session = Depends(get_db)):
    """
    Get all action items for a meeting.
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()
    return items


@router.post("/meetings/{meeting_id}/action-items", response_model=ActionItemResponse, status_code=201)
def create_action_item(
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


@router.put("/action-items/{action_item_id}", response_model=ActionItemResponse)
def update_action_item(
    action_item_id: int,
    action_item_update: ActionItemUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an action item (e.g., mark as completed, change description).
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


@router.delete("/action-items/{action_item_id}", status_code=204)
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
