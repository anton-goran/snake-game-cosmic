from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, spectate

app = FastAPI(
    title="Snake Game Cosmic API",
    description="Backend API for the Snake Game Cosmic application.",
    version="1.0.0"
)

# CORS (Allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(spectate.router)

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")
