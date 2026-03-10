FROM python:3.11-slim

# Only runtime dependencies - NO build tools needed (using pre-built wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

# Install dlib from pre-built wheel (no compilation, no memory issues)
RUN pip install --no-cache-dir dlib --only-binary=dlib

# Install remaining dependencies (all have pre-built wheels)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-download MediaPipe model at build time
RUN python -c "from app.services.face_logic import face_logic; print('MediaPipe model ready')"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
