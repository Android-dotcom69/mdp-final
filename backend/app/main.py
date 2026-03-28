from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import faces, webcam
from app.core.config import settings
from app.core.database import engine, Base
from app.models.face import Face
from app.routers.webcam import load_known_faces
import os

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

origins = [
    "http://localhost:3000",
    settings.FRONTEND_URL,
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
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

@app.get("/debug/info")
async def debug_info():
    """Debug endpoint to verify which models and code version are deployed."""
    import cv2
    from app.services.face_logic import face_logic
    return {
        "detection_model": "YuNet (face_detection_yunet_2023mar.onnx)",
        "recognition_model": "SFace (face_recognition_sface_2021dec.onnx)",
        "matching_method": "cosine_similarity",
        "matching_threshold": 0.35,
        "opencv_version": cv2.__version__,
        "yunet_model_exists": os.path.exists(face_logic.yunet_model_path),
        "sface_model_exists": os.path.exists(face_logic.sface_model_path),
        "cached_faces_count": len(webcam.known_faces_cache["encodings"]),
        "cached_face_names": webcam.known_faces_cache["names"],
        "code_version": "v2.1-yunet-sface-cosine",
    }
