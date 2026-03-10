# MDP Face Recognition System

Full-stack face recognition security system with a FastAPI backend and React frontend.

## Architecture

- **`/backend`** — FastAPI + PostgreSQL + dlib/MediaPipe (deployed on Render)
- **`/frontend`** — React + Tailwind CSS (deployed on Vercel)

## How It Works

1. Browser webcam captures frames via `react-webcam`
2. Frames are sent to the FastAPI backend every 500ms
3. Backend runs face detection (MediaPipe + HOG fallback) and extracts 128-d embeddings (dlib)
4. Embeddings are compared against registered faces in PostgreSQL (Euclidean distance, 0.6 threshold)
5. Results (name, confidence, bounding box) are returned to the frontend
6. Frontend draws green (known) / red (unknown) bounding boxes and updates the dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webcam/process_frame` | Upload a frame for face recognition |
| POST | `/api/v1/faces/register` | Register a new face (name + image) |
| POST | `/api/v1/faces/detect` | Detect faces in an image |
| POST | `/api/v1/faces/recognize` | Recognize a face against DB |
| GET | `/api/v1/faces/` | List all registered faces |
| DELETE | `/api/v1/faces/{id}` | Delete a registered face |
| GET | `/health` | Health check |

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
# Start PostgreSQL (via docker-compose)
docker-compose up -d
# Run the server
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Set `REACT_APP_API_URL=http://localhost:8000` in `frontend/.env`.
