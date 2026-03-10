from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.face_service import face_service, FaceService
from app.schemas.face import FaceCreate, FaceRead, ComparisonResult
from app.routers.webcam import known_faces_cache, load_known_faces  # Import the cache
from sqlalchemy import select
from app.models.face import Face
import numpy as np
from typing import List

router = APIRouter()

@router.post("/detect", response_model=List[dict])
async def detect_faces(file: UploadFile = File(...)):
    """
    Detects faces in an uploaded image. Returns locations and embeddings (raw).
    """
    contents = await file.read()
    results = await face_service.process_image(contents)
    return results

@router.post("/register", response_model=FaceRead)
async def register_face(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Registers a new face from an uploaded image.
    Expects exactly one face in the image.
    """
    contents = await file.read()
    results = await face_service.process_image(contents)
    
    if not results:
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    if len(results) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please upload an image with a single face.")
        
    embedding = results[0]["embedding"]
    
    face_in = FaceCreate(name=name, embedding=embedding, source="upload")
    service = FaceService()
    saved_face = await service.create_face(db, face_in)
    
    # Update Cache immediately so webcam can recognize it!
    known_faces_cache["encodings"].append(np.array(embedding))
    known_faces_cache["names"].append(name)
    
    return saved_face

@router.post("/recognize", response_model=ComparisonResult)
async def recognize_face(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Recognizes a face from an uploaded image against the DB.
    """
    contents = await file.read()
    results = await face_service.process_image(contents)
    
    if not results:
        raise HTTPException(status_code=400, detail="No face detected")
    
    # Use the first face found for recognition
    target_embedding = results[0]["embedding"]
    
    service = FaceService()
    match_result = await service.find_closest_match(db, target_embedding)
    
    return match_result

@router.get("/", response_model=List[FaceRead])
async def list_faces(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    service = FaceService()
    return await service.get_faces(db, skip, limit)

@router.delete("/{face_id}")
async def delete_face(face_id: int, db: AsyncSession = Depends(get_db)):
    """
    Deletes a registered face by ID and refreshes the recognition cache.
    """
    result = await db.execute(select(Face).where(Face.id == face_id))
    face = result.scalar_one_or_none()
    if not face:
        raise HTTPException(status_code=404, detail="Face not found")
    await db.delete(face)
    await db.commit()
    # Reload cache so recognition reflects the deletion
    await load_known_faces()
    return {"message": f"Face {face_id} deleted successfully"}
