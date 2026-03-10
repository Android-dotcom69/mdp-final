from fastapi import APIRouter, UploadFile, File
from app.services.face_service import face_service
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.face import Face
import numpy as np

router = APIRouter()

# Simple In-Memory Cache
known_faces_cache = {
    "encodings": [],
    "names": []
}

async def load_known_faces():
    """
    Refresh the local cache of known faces from the database.
    """
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Face))
            faces = result.scalars().all()
            # Convert list of floats to numpy array
            known_faces_cache["encodings"] = [np.array(f.embedding) for f in faces]
            known_faces_cache["names"] = [f.name for f in faces]
            print(f"Loaded {len(faces)} faces into cache.")
    except Exception as e:
        print(f"Failed to load known faces: {e}")

@router.post("/process_frame")
async def process_frame(file: UploadFile = File(...)):
    """
    Accepts an uploaded image frame and runs face recognition against cached known faces.
    The browser captures webcam frames and sends them here.
    """
    # Force reload cache if empty (first run sometimes has timing issues)
    if not known_faces_cache["encodings"]:
        print("Empty cache, reloading...")
        await load_known_faces()

    # Read uploaded frame bytes
    frame_bytes = await file.read()

    # Process using MediaPipe + face_recognition
    results = await face_service.process_image(frame_bytes)

    known_encodings = known_faces_cache["encodings"]
    known_names = known_faces_cache["names"]

    response_data = []

    if not results:
        return {"message": "No faces detected", "faces": []}

    for face_data in results:
        unknown_encoding = face_data["embedding"]
        name = "Unknown"
        confidence = 0.0
        debug = {}

        if known_encodings and len(known_encodings) > 0:
            matrix = np.array(known_encodings)
            differences = matrix - np.array(unknown_encoding)
            distances = np.linalg.norm(differences, axis=1)

            min_idx = np.argmin(distances)
            min_dist = distances[min_idx]

            debug = {known_names[i]: float(distances[i]) for i in range(len(known_names))}

            # Confidence calculation: 1.0 is perfect match (dist=0), 0.0 is terrible (dist=1.0)
            # Threshold 0.6
            if min_dist < 0.6:
                name = known_names[min_idx]
                confidence = max(0, 1 - min_dist)
            else:
                pass

        response_data.append({
            "name": name,
            "confidence": float(confidence),
            "location": face_data["location"],
            "debug": debug
        })

    return {"faces": response_data}
