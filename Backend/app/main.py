from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
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



@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("static/index.html")

# Mount assets (CSS/JS) - check if directory exists to avoid error during dev if not built
import os
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# Catch-all for SPA
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404)
    
    # Return index.html for any other route (React Router)
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"message": "Frontend not built or not found"}
