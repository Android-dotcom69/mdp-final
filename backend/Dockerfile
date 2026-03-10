FROM python:3.11-slim

# Limit parallel compilation to reduce memory usage (dlib is memory-hungry)
ENV CMAKE_BUILD_PARALLEL_LEVEL=1
ENV MAKEFLAGS="-j1"

# Install only essential system deps (removed libboost-all-dev — not needed for dlib Python bindings, was using ~4GB)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install dlib first (most memory-intensive step) then the rest
RUN pip install --no-cache-dir dlib
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-download MediaPipe model at build time
RUN python -c "from app.services.face_logic import face_logic; print('MediaPipe model ready')"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
