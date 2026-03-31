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

MATCH_THRESHOLD = 0.30  # Lower threshold for more lenient matching

def scale_confidence(cosine_score):
    """
    Map raw cosine similarity to user-friendly confidence percentage.
    SFace cosine range: 0.30 (weak match) to 1.0 (perfect match)
    Maps to: 60% to 100% display range
    """
    if cosine_score <= MATCH_THRESHOLD:
        return 0.0
    # Map 0.30-1.0 -> 0.60-1.0 (display range)
    scaled = 0.60 + (cosine_score - MATCH_THRESHOLD) / (1.0 - MATCH_THRESHOLD) * 0.40
    return min(1.0, scaled)

async def load_known_faces():
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Face))
            faces = result.scalars().all()

            # Group embeddings by name for averaging
            name_embeddings = {}
            for f in faces:
                enc = np.array(f.embedding)
                # Normalize if not already normalized
                norm = np.linalg.norm(enc)
                if norm > 1.5:  # Raw embedding (not normalized)
                    enc = enc / norm
                if f.name not in name_embeddings:
                    name_embeddings[f.name] = []
                name_embeddings[f.name].append(enc)

            # Average multiple embeddings per person for more robust matching
            known_faces_cache["encodings"] = []
            known_faces_cache["names"] = []
            for name, encs in name_embeddings.items():
                if len(encs) > 1:
                    avg_enc = np.mean(encs, axis=0)
                    avg_enc = avg_enc / (np.linalg.norm(avg_enc) + 1e-10)
                    known_faces_cache["encodings"].append(avg_enc)
                    print(f"  Face '{name}': averaged {len(encs)} embeddings")
                else:
                    known_faces_cache["encodings"].append(encs[0])
                    print(f"  Face '{name}': single embedding")
                known_faces_cache["names"].append(name)

            print(f"Loaded {len(faces)} face records -> {len(known_faces_cache['names'])} unique persons.")
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

        # Normalize if not already
        if unk_norm > 1.5:
            unk_normalized = unknown_encoding / (unk_norm + 1e-10)
        else:
            unk_normalized = unknown_encoding

        print(f"Detected face at location={loc}, embedding norm={unk_norm:.4f}")

        cosine_scores = []
        if known_encodings and len(known_encodings) > 0:
            for known_enc in known_encodings:
                score = float(np.dot(unk_normalized, known_enc))
                cosine_scores.append(score)

            max_idx = int(np.argmax(cosine_scores))
            max_score = cosine_scores[max_idx]

            scores_str = ", ".join([f"{known_names[i]}={s:.3f}" for i, s in enumerate(cosine_scores)])
            print(f"  Scores: [{scores_str}]")
            print(f"  Best match: {known_names[max_idx]} cosine={max_score:.3f} (threshold={MATCH_THRESHOLD})")

            if max_score > MATCH_THRESHOLD:
                name = known_names[max_idx]
                confidence = scale_confidence(max_score)

        response_data.append({
            "name": name,
            "confidence": float(confidence),
            "location": face_data["location"],
            "debug_scores": {known_names[i]: round(s, 4) for i, s in enumerate(cosine_scores)} if known_encodings else {},
            "debug_embedding_norm": round(unk_norm, 4),
        })

    return {"faces": response_data}
