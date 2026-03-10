from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FaceBase(BaseModel):
    name: str
    source: Optional[str] = "webcam"

class FaceCreate(FaceBase):
    embedding: List[float]

class FaceRead(FaceBase):
    id: int
    created_at: datetime
    # embedding: list[float]  # Optionally include, can be large

    class Config:
        from_attributes = True

class FaceMatch(BaseModel):
    face_id: int
    name: str
    distance: float
    confidence: float

class ComparisonResult(BaseModel):
    matches: List[FaceMatch]
    best_match: Optional[FaceMatch]
