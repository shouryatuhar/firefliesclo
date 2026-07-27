# Fireflies.ai Clone

> A production-inspired full-stack clone of Fireflies.ai built with Next.js, FastAPI, TypeScript and SQLite for the Scaler AI Labs Full Stack (SDE) Assignment.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

---

# Live Demo

### Frontend
https://firefliesclo.vercel.app

### Backend API
https://firefliesclo-production.up.railway.app

### Swagger Documentation
https://firefliesclo-production.up.railway.app/docs

### GitHub Repository
https://github.com/shouryatuhar/firefliesclo

---

# Overview

Fireflies.ai Clone is a modern AI Meeting Intelligence Platform inspired by Fireflies.ai. It enables users to manage meetings, browse AI-generated summaries, search transcripts, organise action items and interact with meeting data through a clean production-style interface.

The project was developed as part of the **Scaler AI Labs Full Stack (SDE) Assignment**, focusing on scalable architecture, clean UI, REST APIs and production deployment.

> **Disclaimer**
>
> This project is an educational implementation inspired by Fireflies.ai and is **not affiliated with, endorsed by, or associated with Fireflies.ai**.

---

# Features

## Meeting Management

- Create meetings
- Edit meetings
- Delete meetings
- Dashboard with meeting cards
- Participant management
- Persistent SQLite database

---

## Interactive Transcript

- Speaker-labelled transcript
- Timestamp navigation
- Transcript search
- Search highlighting
- Click transcript to seek playback
- Active transcript synchronisation

---

## AI Notes

- Meeting summaries
- Key discussion topics
- Action items
- Editable action items

---

## Search & Filtering

- Global search
- Search by meeting title
- Search transcript text
- Filter by participant
- Filter by date
- Sort meetings

---

## Additional Features

- Fireflies-inspired UI
- Responsive design
- Landing page
- Sidebar workspace
- Dark theme
- REST API
- Swagger documentation

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## Deployment

- Vercel
- Railway

---

# Project Structure

```text
firefliesclo/
│
├── backend/
│
├── frontend/
│
├── README-assets/
│   ├── landing-page.png
│   ├── meetings-dashboard.png
│   ├── meeting-transcript.png
│   ├── swagger-api.png
│   └── lighthouse-score.png
│
└── README.md
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/shouryatuhar/firefliesclo.git

cd firefliesclo
```

---

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python -m app.seed

uvicorn app.main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:3000
```

---

# Screenshots

## Landing Page

![Landing Page](./README-assets/Screenshot%202026-07-27%20at%2010.41.44.png)

Production-inspired landing page showcasing the Fireflies.ai clone.

---

## Meetings Dashboard

![Meetings Dashboard](./README-assets/Screenshot%202026-07-27%20at%2010.41.57.png)

Browse meetings, create new meetings, search conversations, filter participants, and manage your workspace.

---

## Interactive Transcript & Playback

![Interactive Transcript](./README-assets/Screenshot%202026-07-27%20at%2010.42.15.png)

Timestamp-synchronised transcript with playback controls, transcript search, and AI meeting notes.

---

## REST API Documentation

![Swagger API](./README-assets/Screenshot%202026-07-27%20at%2010.47.48.png)

OpenAPI (Swagger UI) documenting all backend REST endpoints.

---

## Lighthouse Performance

| Metric | Score |
|---------|------:|
| Performance | **99** |
| Accessibility | **94** |
| Best Practices | **100** |
| SEO | **100** |

![Lighthouse Report](./README-assets/Screenshot%202026-07-27%20at%2010.48.13.png)
---
# Future Improvements

- Authentication
- Real speech-to-text transcription
- Live meeting bot
- Google Meet integration
- Zoom integration
- Team collaboration
- Workspace sharing
- Cloud storage

---

# Why this project?

This project demonstrates production-oriented full-stack engineering skills including:

- Modern React development
- Next.js App Router
- FastAPI REST APIs
- SQL database modelling
- CRUD operations
- Search & filtering
- Responsive UI development
- Production deployment
- API documentation
- Performance optimisation

---

# License

This repository was created solely for educational purposes as part of the Scaler AI Labs Full Stack Assignment.
