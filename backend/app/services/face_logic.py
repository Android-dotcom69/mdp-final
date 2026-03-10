import cv2
import numpy as np
import face_recognition
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import os
import httpx
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceLogic:
    def __init__(self):
        # MediaPipe Tasks API requires a model file
        # Use absolute path relative to this file
        service_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.abspath(os.path.join(service_dir, "..", "..", "models", "face_detector.tflite"))
        self._ensure_model_exists()
        
        # Initialize MediaPipe Face Detection Task
        base_options = python.BaseOptions(model_asset_path=self.model_path)
        options = vision.FaceDetectorOptions(
            base_options=base_options,
            min_detection_confidence=0.5
        )
        self.detector = vision.FaceDetector.create_from_options(options)
        logger.info("MediaPipe FaceDetector initialized with Tasks API")

    def _ensure_model_exists(self):
        """Ensures the face detection model exists locally, downloads it if missing."""
        if not os.path.exists(self.model_path):
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            # Using short range or long range model
            url = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
            logger.info(f"Downloading MediaPipe model from {url}...")
            import urllib.request
            try:
                urllib.request.urlretrieve(url, self.model_path)
                logger.info(f"Model downloaded successfully to {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to download MediaPipe model: {e}")
                raise Exception(f"Failed to download MediaPipe model from {url}") from e

    def detect_faces(self, image_bytes: bytes):
        """
        Detects faces in an image byte stream.
        1. Uses MediaPipe Tasks API for robust detection.
        2. Fallback to HOG if MediaPipe fails or is not available.
        3. Extracts embeddings using dlib (face_recognition).
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_bgr is None:
            return []

        h, w, c = img_bgr.shape
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # 1. MediaPipe Detection
        face_locations = []
        try:
            # New Tasks API usage
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            results = self.detector.detect(mp_image)
            
            if results.detections:
                for detection in results.detections:
                    bbox = detection.bounding_box
                    
                    # Coordinates in Tasks API are in absolute pixels
                    xmin = bbox.origin_x
                    ymin = bbox.origin_y
                    width = bbox.width
                    height = bbox.height
                    
                    # Expand box slightly (10%) for better landmark detection context
                    margin_x = int(width * 0.1)
                    margin_y = int(height * 0.1)
                    
                    top = max(0, ymin - margin_y)
                    bottom = min(h, ymin + height + margin_y)
                    left = max(0, xmin - margin_x)
                    right = min(w, xmin + width + margin_x)
                    
                    # Face Recognition expects (top, right, bottom, left)
                    face_locations.append((top, right, bottom, left))
        except Exception as e:
            logger.error(f"MediaPipe detection failed: {e}")
        
        # 2. HOG Fallback (if MediaPipe found no faces or failed)
        if not face_locations:
            face_locations = face_recognition.face_locations(img_rgb, number_of_times_to_upsample=2, model="hog")

        # 3. Compute Embeddings
        if face_locations:
             encodings = face_recognition.face_encodings(img_rgb, face_locations, num_jitters=1, model="large")
             
             results_final = []
             for loc, enc in zip(face_locations, encodings):
                 results_final.append({
                     "location": list(loc), # Convert tuple to list for consistency/JSON
                     "embedding": enc.tolist()
                 })
             return results_final
             
        return []

face_logic = FaceLogic()
