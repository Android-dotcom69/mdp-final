FROM python:3.11-slim

ENV CMAKE_BUILD_PARALLEL_LEVEL=2
ENV MAKEFLAGS="-j2"

# Install system dependencies for dlib compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements from backend/
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

# Pre-download MediaPipe model at build time
RUN python -c "from app.services.face_logic import face_logic; print('MediaPipe model ready')"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
