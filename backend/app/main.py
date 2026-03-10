from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import faces, webcam
from app.core.config import settings
from app.core.database import engine, Base
from app.models.face import Face  # Import models so metadata is known
from app.routers.webcam import load_known_faces

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS - allow the React frontend to call this API
origins = [
    "http://localhost:3000",       # local React dev
    settings.FRONTEND_URL,         # production Vercel URL (set via env var)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Load known faces cache
    try:
        await load_known_faces()
    except Exception as e:
        print(f"Failed to load known faces: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    pass

app.include_router(faces.router, prefix="/api/v1/faces", tags=["faces"])
app.include_router(webcam.router, prefix="/api/v1/webcam", tags=["webcam"])

@app.get("/")
def read_root():
    return {"message": "Face Recognition API is running. See /docs for API documentation."}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
