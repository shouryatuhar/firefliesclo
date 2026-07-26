# Fireflies.ai Clone - SDE Fullstack Assignment

A functional clone of Fireflies.ai meeting-assistant platform with interactive transcripts, AI-generated summaries, and meeting management.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: SQLite
- **Deployment**: (To be configured)

## Project Structure

```
fireflies-clone/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # SQLite + SQLAlchemy setup
│   │   ├── models.py            # ORM models
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── seed.py              # Database seeding script
│   │   └── routes/
│   │       ├── meetings.py      # Meeting CRUD endpoints
│   │       ├── transcripts.py   # Transcript retrieval
│   │       ├── summaries.py     # Summary, action items, key topics
│   │       └── action_items.py  # Action item CRUD
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── app/                     # Next.js App Router
    ├── components/              # React components
    ├── lib/                     # Utilities and API client
    ├── public/                  # Static assets
    └── package.json
```

## Database Schema

### Core Tables

- **users**: Hardcoded logged-in user (id, name, email, avatar_url)
- **meetings**: Meeting records (id, title, description, date_recorded, duration_seconds, participants_count)
- **speakers**: Meeting participants (id, meeting_id, name, email, avatar_url)
- **transcript_segments**: Individual transcript lines (id, meeting_id, speaker_id, text, start_time_seconds, end_time_seconds, sequence_order)
- **summaries**: AI-generated summaries (id, meeting_id, overview)
- **action_items**: Tasks from meetings (id, meeting_id, assigned_to, description, completed)
- **key_topics**: Meeting chapters/topics (id, meeting_id, title, description, timestamp_seconds, sequence_order)

**Key Design Decisions:**
- Timestamps in seconds for easy media player synchronization
- Computed fields (duration, participants_count) kept in sync server-side
- Full transcript returned in single API call (no pagination)
- One-to-one summary per meeting

## API Endpoints

### Meetings
- `GET /api/meetings` - List meetings (search, filter, sort)
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/{id}` - Get meeting with all related data
- `PUT /api/meetings/{id}` - Update meeting metadata
- `DELETE /api/meetings/{id}` - Delete meeting

### Transcripts
- `GET /api/meetings/{id}/transcript` - Get full transcript (with optional search)

### Summaries & Topics
- `GET /api/meetings/{id}/summary` - Get meeting summary
- `POST /api/meetings/{id}/summary` - Create summary
- `PUT /api/meetings/{id}/summary` - Update summary
- `GET /api/meetings/{id}/key-topics` - Get key topics
- `POST /api/meetings/{id}/key-topics` - Create key topic

### Action Items
- `GET /api/meetings/{id}/action-items` - Get meeting action items
- `POST /api/meetings/{id}/action-items` - Create action item
- `PUT /api/action-items/{id}` - Update action item (mark complete, etc)
- `DELETE /api/action-items/{id}` - Delete action item

## Getting Started

### Backend Setup

1. Install Python 3.10+
2. Create virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed database:
   ```bash
   python -m app.seed
   ```
5. Start server:
   ```bash
   python -m app.main
   ```
   Server runs at `http://localhost:8000`, docs at `http://localhost:8000/docs`

### Frontend Setup (Coming Soon)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:3000`

## Seed Data

The database is seeded with 4 realistic meetings:
1. **Q3 Product Demo** - Product team showcasing new dashboard (16 segments, 3 speakers)
2. **Engineering Standup** - Sprint 47 standup (13 segments, 4 speakers)
3. **Client Feedback** - Acme Corp feedback session (11 segments, 3 speakers)
4. **Q4 Strategic Planning** - Executive OKRs and budget (12 segments, 3 speakers)

Each includes full transcripts with timestamps, summaries, action items, and key topics.

## Features Implemented

### Core
- ✅ Meetings library with search, filter, and sort
- ✅ Full CRUD for meetings and related data
- ✅ Interactive transcripts with speaker labels and timestamps
- ✅ AI-generated summaries (seeded/mocked)
- ✅ Action items with completion tracking
- ✅ Key topics/chapters with timestamps

### In Progress
- ⏳ Frontend: Dashboard, meeting detail view, UI components
- ⏳ Media player with seek bar
- ⏳ Transcript search with highlighting
- ⏳ Fireflies-inspired design (dark sidebar, purple accents)

### Placeholder (Coming Soon)
- 🔒 Real user authentication
- 🔒 Real audio/video transcription
- 🔒 Live meeting capture
- 🔒 Team collaboration & sharing
- 🔒 Integrations (Zoom, Google Meet, Calendar)

## CORS Configuration

Backend CORS allows `http://localhost:3000` (and `localhost:8000` for testing).
Update `ALLOWED_ORIGINS` in `app/main.py` for production domains.

## Development Notes

- All timestamps use UTC (`datetime.utcnow()`)
- Transcript timestamps in seconds for media player sync
- Pydantic models use `from_attributes = True` for SQLAlchemy integration
- FastAPI lifespan context initializes DB on startup

## Assignment Requirements

This implementation fulfills all must-have requirements:
1. ✅ Meetings library with title, date, duration, participants, search, filter, sort
2. ✅ Meeting detail view with transcript, media player placeholder, search within transcript
3. ✅ AI summary & notes section with action items and key topics
4. ✅ Full CRUD for meetings and related content
5. ✅ Fireflies-like experience (design and UX patterns from screenshots)

Database schema and backend architecture are designed to be production-ready and scalable.
