# Fireflies.ai Clone

> A production-inspired full-stack clone of Fireflies.ai built with Next.js, FastAPI, TypeScript and SQLite for the Scaler AI Labs Full Stack (SDE) Assignment.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

---

## Overview

This project is a **Fireflies.ai-inspired Meeting Intelligence Platform** that enables users to manage meetings, browse AI-generated notes, explore interactive transcripts, organise action items, and search conversations through a modern SaaS interface.

The application was built as part of the **Scaler AI Labs Full Stack (SDE) Assignment** with a strong focus on production-quality architecture, clean UI, and maintainable code.

> **Disclaimer**
>
> This project is an educational implementation inspired by Fireflies.ai and is **not affiliated with, endorsed by, or associated with Fireflies.ai**.

---

# Features

## Meeting Management

- Create meetings
- Edit meeting metadata
- Delete meetings
- Meeting dashboard
- Participant management
- Persistent SQLite storage

---

## Interactive Transcript

- Speaker-labelled transcript
- Timestamp navigation
- Transcript search
- Search highlighting
- Click transcript to seek playback
- Active transcript synchronisation

---

## AI Meeting Notes

- AI-generated meeting summary
- Key discussion topics
- Meeting outline
- Action items
- Editable action items

---

## AskFred

- Meeting-specific AI assistant
- Context-aware Q&A
- Suggested prompts
- Chat interface

---

## Search & Organisation

- Global meeting search
- Search by title
- Search by participant
- Search by transcript
- Filters
- Tags
- Sorting

---

## Additional Features

- Soundbites
- Meeting exports
- Responsive layout
- Fireflies-inspired UI
- Landing page
- Sidebar navigation
- Dark workspace

---

# Tech Stack

## Frontend

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## Development

- REST APIs
- Git
- GitHub

---

# Project Structure

```text
fireflies-clone/

├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
│
├── backend/
│   ├── app/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
└── README.md
```

---

# Getting Started

## Clone the repository

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/fireflies-clone.git

cd fireflies-clone
```

---

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate        # macOS / Linux

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

> *(Add screenshot here)*

---

## Meetings Dashboard

> *(Add screenshot here)*

---

## Meeting Detail

> *(Add screenshot here)*

---

## Interactive Transcript

> *(Add screenshot here)*

---

## AI Summary & AskFred

> *(Add screenshot here)*

---

# Future Improvements

- User authentication
- Real speech-to-text transcription
- Calendar integrations
- Zoom & Google Meet integrations
- Live meeting bot
- Team collaboration
- Workspace sharing

---

# Why this project?

This project was built to demonstrate full-stack engineering skills including:

- Modern React development
- Backend API design
- Database modelling
- CRUD operations
- Search & filtering
- Responsive UI development
- State management
- Production-inspired application architecture

---

# License

This repository was created solely for educational purposes as part of the Scaler AI Labs Full Stack Assignment.