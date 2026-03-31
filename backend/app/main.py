from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import os

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

origins = [
    "http://localhost:3000",
    "https://mdp-final.vercel.app",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        from app.models.face import Face
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables ready")
    except Exception as e:
        print(f"Database setup error (will retry on first request): {e}")

    try:
        from app.routers.webcam import load_known_faces
        await load_known_faces()
    except Exception as e:
        print(f"Failed to load known faces (will retry on first request): {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    pass

from app.routers import faces, webcam
app.include_router(faces.router, prefix="/api/v1/faces", tags=["faces"])
app.include_router(webcam.router, prefix="/api/v1/webcam", tags=["webcam"])

@app.get("/")
def read_root():
    return {"message": "Face Recognition API is running (v2.1 YuNet+SFace)"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/debug/info")
async def debug_info():
    try:
        import cv2
        from app.services.face_logic import face_logic
        from app.routers.webcam import known_faces_cache
        return {
            "code_version": "v2.1-yunet-sface-cosine",
            "detection_model": "YuNet",
            "recognition_model": "SFace",
            "matching_method": "cosine_similarity",
            "matching_threshold": 0.35,
            "opencv_version": cv2.__version__,
            "yunet_model_exists": os.path.exists(face_logic.yunet_model_path),
            "sface_model_exists": os.path.exists(face_logic.sface_model_path),
            "cached_faces_count": len(known_faces_cache["encodings"]),
            "cached_face_names": known_faces_cache["names"],
        }
    except Exception as e:
        return {"error": str(e)}
