from fastapi import APIRouter, UploadFile, File
from app.services.face_service import face_service
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.face import Face
import numpy as np

router = APIRouter()

known_faces_cache = {
    "encodings": [],
    "names": []
}

async def load_known_faces():
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Face))
            faces = result.scalars().all()
            known_faces_cache["encodings"] = [np.array(f.embedding) for f in faces]
            known_faces_cache["names"] = [f.name for f in faces]
            print(f"Loaded {len(faces)} faces into cache.")
            for i, (enc, name) in enumerate(zip(known_faces_cache["encodings"], known_faces_cache["names"])):
                norm = float(np.linalg.norm(enc))
                print(f"  Face '{name}': embedding dim={enc.shape}, L2 norm={norm:.4f}")
    except Exception as e:
        print(f"Failed to load known faces: {e}")

@router.post("/process_frame")
async def process_frame(file: UploadFile = File(...)):
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

        loc = face_data["location"]
        unk_norm = float(np.linalg.norm(unknown_encoding))
        print(f"Detected face at location={loc}, embedding norm={unk_norm:.4f}, dim={unknown_encoding.shape}")

        if known_encodings and len(known_encodings) > 0:
            unk_normalized = unknown_encoding / (np.linalg.norm(unknown_encoding) + 1e-10)

            cosine_scores = []
            for known_enc in known_encodings:
                known_normalized = known_enc / (np.linalg.norm(known_enc) + 1e-10)
                score = float(np.dot(unk_normalized, known_normalized))
                cosine_scores.append(score)

            max_idx = int(np.argmax(cosine_scores))
            max_score = cosine_scores[max_idx]

            scores_str = ", ".join([f"{known_names[i]}={s:.3f}" for i, s in enumerate(cosine_scores)])
            print(f"  Scores: [{scores_str}]")
            print(f"  Best match: {known_names[max_idx]} cosine={max_score:.3f} (threshold=0.35)")

            if max_score > 0.35:
                name = known_names[max_idx]
                confidence = max_score

        response_data.append({
            "name": name,
            "confidence": float(confidence),
            "location": face_data["location"],
            "debug_scores": {known_names[i]: round(s, 4) for i, s in enumerate(cosine_scores)} if known_encodings else {},
            "debug_embedding_norm": round(unk_norm, 4),
        })

    return {"faces": response_data}
