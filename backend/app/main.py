"""
FastAPI application entry point.
Sets up CORS, database initialization, and route registration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routes import meetings, transcripts, summaries

# Lifespan context for startup/shutdown tasks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()

    from app.seed import seed_database
    seed_database()

    print("✅ Database initialized")

    yield

    # Shutdown
    pass


# Create FastAPI app with lifespan
app = FastAPI(
    title="Fireflies.ai Clone API",
    description="Meeting transcription and notes platform API",
    version="1.0.0",
    lifespan=lifespan
)


# Configure CORS for Next.js frontend
ALLOWED_ORIGINS = [
    "http://localhost:3000",      # Local development
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "http://localhost:8000",      # For testing
    "http://127.0.0.1:8000",
    "https://firefliesclo.vercel.app",
    "https://firefliesclo-hqi3b5lnt-shouryatuhars-projects.vercel.app",
    # Add your production domains here
    # "https://yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "message": "Fireflies.ai Clone API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    """Health check for load balancers."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
