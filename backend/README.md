
# Face Recognition Backend Service

This service provides a modular backend for face detection and recognition using Python, FastAPI, OpenCV, and PostgreSQL.

## Features

- **Webcam Integration**: Real-time video streaming processing.
- **Face Detection & Recognition**: Utilizing `face_recognition` (dlib) and OpenCV.
- **Database Storage**: Storing 128-d face embeddings in PostgreSQL using `ARRAY` type.
- **REST API**: Identify faces, register new faces, and view live feed.

## Prerequisites

1. **Python 3.9+**
2. **PostgreSQL**: Ensure a local Postgres server is running.
   - Create a database (e.g., `face_db`).
3. **C++ Build Tools**: Required for compiling `dlib` (dependency of `face_recognition`). 
   - Install Visual Studio Build Tools with "Desktop development with C++" workload if `pip install dlib` fails.
   - Alternatively run `pip install cmake` before installing requirements.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configuration**:
   - Create a `.env` file based on `.env.example`.
   - Update `DATABASE_URL` with your Postgres credentials.
     Example: `DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/face_db`

3. **Database Initialization**:
   - The tables are automatically created on first run.

## Running the Service

Start the server with hot-reload:

```bash
uvicorn app.main:app --reload
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Faces
- `POST /api/v1/faces/detect`: Detect faces in an uploaded image.
- `POST /api/v1/faces/register`: Register a new face (upload image + name).
- `POST /api/v1/faces/recognize`: Recognize a face from an uploaded image.
- `GET /api/v1/faces/`: List all registered faces.

### Webcam
- `GET /api/v1/webcam/feed`: MJPEG stream of the local webcam.
- `GET /api/v1/webcam/snapshot`: Capture a single frame (JPEG).
- `POST /api/v1/webcam/process_current_frame`: Capture and recognize faces in the current webcam frame.

## Testing

Run the test suite:

```bash
pytest
```
>>>>>>> 3282830 (A face detection model with a database for storing the embeddings to retrive and identify the stored faces and flags unidetified ones)
