from sqlalchemy import String, Integer, DateTime, func, ARRAY, Float, Column
from sqlalchemy.orm import Mapped, mapped_column
from typing import List, Optional
from datetime import datetime
from app.core.database import Base

class Face(Base):
    __tablename__ = "faces"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    embedding: Mapped[List[float]] = mapped_column(ARRAY(Float), nullable=False)  # 128-d usually
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # webcam/IP cam

    def __repr__(self):
        return f"<Face(name='{self.name}', id={self.id})>"
