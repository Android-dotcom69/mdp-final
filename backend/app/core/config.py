from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Face Recognition API"
    VERSION: str = "1.0.0"

    # DATABASE
    # Example: postgresql+asyncpg://user:password@localhost/dbname
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/face_db"

    # FACE RECOGNITION
    SIMILARITY_THRESHOLD: float = 0.6  # Default threshold for recognition (roughly 0.6 distance is threshold)

    # API
    API_V1_STR: str = "/api/v1"

    # CORS - Frontend URL for allowed origins
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
