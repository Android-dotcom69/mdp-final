from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.face import Face
from app.schemas.face import FaceCreate, FaceMatch, ComparisonResult
from app.services.face_logic import face_logic
import numpy as np
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

class FaceService:
    async def create_face(self, db: AsyncSession, face: FaceCreate) -> Face:
        db_face = Face(**face.model_dump())
        db.add(db_face)
        await db.commit()
        await db.refresh(db_face)
        return db_face

    async def get_faces(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        result = await db.execute(select(Face).offset(skip).limit(limit))
        return result.scalars().all()

    async def find_closest_match(self, db: AsyncSession, input_embedding: list[float], threshold: float = 0.6) -> ComparisonResult:
        """
        Finds the closest face in the DB.
        """
        # Fetch all faces (inefficient for large DB, use pgvector later)
        # For < 1000 faces, fetching all 128-d vectors is fine.
        result = await db.execute(select(Face.id, Face.name, Face.embedding))
        faces = result.all() # returns Row objects (id, name, embedding)
        
        if not faces:
            return ComparisonResult(matches=[], best_match=None)

        # Convert to numpy matrix
        embeddings = np.array([f.embedding for f in faces])
        names = [f.name for f in faces]
        ids = [f.id for f in faces]
        
        input_vec = np.array(input_embedding)
        
        # Compute distances (axis=1) - Euclidean
        distances = np.linalg.norm(embeddings - input_vec, axis=1)
        
        # Find best match
        min_idx = np.argmin(distances)
        min_dist = distances[min_idx]
        
        matches = []
        # Filter by threshold
        for idx, dist in enumerate(distances):
            if dist < threshold:
                confidence = max(0, (1 - dist)) # Simplified confidence
                matches.append(FaceMatch(
                    face_id=ids[idx],
                    name=names[idx],
                    distance=float(dist),
                    confidence=confidence
                ))

        matches.sort(key=lambda x: x.distance)
        
        best = matches[0] if matches else None
        
        return ComparisonResult(matches=matches, best_match=best)

    async def process_image(self, image_bytes: bytes):
        """
        Runs CPU-bound face detection in a thread pool.
        """
        loop = asyncio.get_running_loop()
        # Since face_logic is synchronous, run in executor
        # detect_faces returns list of {location, embedding}
        results = await loop.run_in_executor(
            executor, 
            face_logic.detect_faces, 
            image_bytes
        )
        return results

face_service = FaceService()
