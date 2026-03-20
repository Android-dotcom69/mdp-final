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
            known_faces_cache["encodings"] = [np.array(f.embedding) for f in faces]
            known_faces_cache["names"] = [f.name for f in faces]
            print(f"Loaded {len(faces)} faces into cache.")
    except Exception as e:
        print(f"Failed to load known faces: {e}")

@router.post("/process_frame")
async def process_frame(file: UploadFile = File(...)):
    """
    Accepts an uploaded image frame and runs face recognition against cached known faces.
    Uses cosine similarity for matching (SFace embeddings are L2-normalized).
    """
    if not known_faces_cache["encodings"]:
        print("Empty cache, reloading...")
        await load_known_faces()

    frame_bytes = await file.read()
    results = await face_service.process_image(frame_bytes)

    known_encodings = known_faces_cache["encodings"]
    known_names = known_faces_cache["names"]

    response_data = []

    if not results:
        return {"message": "No faces detected", "faces": []}

    for face_data in results:
        unknown_encoding = np.array(face_data["embedding"])
        name = "Unknown"
        confidence = 0.0

        if known_encodings and len(known_encodings) > 0:
            # Cosine similarity: dot product of L2-normalized vectors
            # SFace embeddings are already L2-normalized, so dot product = cosine similarity
            # Same person: ~0.5-1.0, Different person: ~0.0-0.4
            # Recommended threshold: 0.363
            cosine_scores = []
            for known_enc in known_encodings:
                score = float(np.dot(unknown_encoding, known_enc))
                cosine_scores.append(score)

            max_idx = int(np.argmax(cosine_scores))
            max_score = cosine_scores[max_idx]

            print(f"Best match: {known_names[max_idx]} with cosine={max_score:.3f}")

            # Threshold 0.35 (slightly below SFace recommended 0.363 for more tolerance)
            if max_score > 0.35:
                name = known_names[max_idx]
                confidence = max_score

        response_data.append({
            "name": name,
            "confidence": float(confidence),
            "location": face_data["location"],
        })

    return {"faces": response_data}
