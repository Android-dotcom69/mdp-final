FROM python:3.11-slim

# Only runtime deps — no build tools needed (all packages have pre-built wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Pre-download ML models at build time (MediaPipe + SFace)
RUN python -c "from app.services.face_logic import face_logic; print('Models ready')"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
