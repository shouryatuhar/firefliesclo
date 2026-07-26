"""
Pydantic schemas for request/response validation and serialization.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SPEAKER SCHEMAS
# ============================================================================

class SpeakerBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class SpeakerCreate(SpeakerBase):
    pass


class SpeakerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class SpeakerResponse(SpeakerBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True


# ============================================================================
# TRANSCRIPT SEGMENT SCHEMAS
# ============================================================================

class TranscriptSegmentBase(BaseModel):
    speaker_id: int
    text: str
    start_time_seconds: float
    end_time_seconds: float
    sequence_order: Optional[int] = None


class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass


class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: int
    meeting_id: int
    speaker: Optional[SpeakerResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ACTION ITEM SCHEMAS
# ============================================================================

class ActionItemBase(BaseModel):
    description: str
    assigned_to: Optional[str] = None
    completed: bool = False


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    completed: Optional[bool] = None


class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# KEY TOPIC SCHEMAS
# ============================================================================

class KeyTopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    timestamp_seconds: Optional[float] = None
    sequence_order: Optional[int] = None


class KeyTopicCreate(KeyTopicBase):
    pass


class KeyTopicResponse(KeyTopicBase):
    id: int
    meeting_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SUMMARY SCHEMAS
# ============================================================================

class SummaryBase(BaseModel):
    overview: str


class SummaryCreate(SummaryBase):
    pass


class SummaryUpdate(SummaryBase):
    pass


class SummaryResponse(SummaryBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# MEETING SCHEMAS
# ============================================================================

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    date_recorded: datetime
    thumbnail_url: Optional[str] = None


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date_recorded: Optional[datetime] = None
    thumbnail_url: Optional[str] = None


class MeetingDetailResponse(MeetingBase):
    id: int
    duration_seconds: Optional[int]
    participants_count: int
    created_at: datetime
    updated_at: datetime
    speakers: List[SpeakerResponse] = []
    transcript_segments: List[TranscriptSegmentResponse] = []
    summary: Optional[SummaryResponse] = None
    action_items: List[ActionItemResponse] = []
    key_topics: List[KeyTopicResponse] = []

    class Config:
        from_attributes = True


class MeetingListResponse(MeetingBase):
    id: int
    duration_seconds: Optional[int]
    participants_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# FULL MEETING DATA (for POST create, returns full meeting with nested data)
# ============================================================================

# ============================================================================
# FULL MEETING CREATE SCHEMA (nested, for bulk create endpoint)
# ============================================================================

class SpeakerCreateNested(BaseModel):
    """Speaker info nested in MeetingFullCreate."""
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class TranscriptSegmentCreateNested(BaseModel):
    """Transcript segment nested in MeetingFullCreate."""
    speaker_name: str  # References a speaker by name from the speakers list
    text: str
    start_time_seconds: float
    end_time_seconds: float
    sequence_order: Optional[int] = None


class ActionItemCreateNested(BaseModel):
    """Action item nested in MeetingFullCreate."""
    description: str
    assigned_to: Optional[str] = None
    completed: bool = False


class KeyTopicCreateNested(BaseModel):
    """Key topic nested in MeetingFullCreate."""
    title: str
    description: Optional[str] = None
    timestamp_seconds: Optional[float] = None
    sequence_order: Optional[int] = None


class MeetingFullCreate(BaseModel):
    """
    Complete meeting creation request with nested speakers, transcript, summary, etc.
    Creates entire meeting + related data in a single transaction.
    """
    # Meeting fields
    title: str
    description: Optional[str] = None
    date_recorded: datetime
    thumbnail_url: Optional[str] = None
    
    # Related data
    speakers: List[SpeakerCreateNested]
    transcript_segments: List[TranscriptSegmentCreateNested]
    summary: Optional[SummaryCreate] = None
    action_items: Optional[List[ActionItemCreateNested]] = None
    key_topics: Optional[List[KeyTopicCreateNested]] = None


class MeetingFullResponse(MeetingDetailResponse):
    pass
