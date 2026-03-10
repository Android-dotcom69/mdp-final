import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FaceLogic:
    def __init__(self):
        service_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.abspath(os.path.join(service_dir, "..", "..", "models"))
        os.makedirs(models_dir, exist_ok=True)

        # --- MediaPipe Face Detection ---
        self.mp_model_path = os.path.join(models_dir, "face_detector.tflite")
        self._download_if_missing(
            self.mp_model_path,
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
        )
        base_options = python.BaseOptions(model_asset_path=self.mp_model_path)
        options = vision.FaceDetectorOptions(
            base_options=base_options,
            min_detection_confidence=0.5
        )
        self.detector = vision.FaceDetector.create_from_options(options)

        # --- SFace Face Recognition (128-d embeddings, no dlib needed) ---
        self.sface_model_path = os.path.join(models_dir, "face_recognition_sface_2021dec.onnx")
        self._download_if_missing(
            self.sface_model_path,
            "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
        )
        self.recognizer = cv2.FaceRecognizerSF.create(self.sface_model_path, "")

        # --- Haar Cascade fallback (bundled with OpenCV) ---
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )

        logger.info("FaceLogic initialized (MediaPipe + SFace + Haar fallback)")

    def _download_if_missing(self, path, url):
        if not os.path.exists(path):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            logger.info(f"Downloading model from {url}...")
            import urllib.request
            try:
                urllib.request.urlretrieve(url, path)
                logger.info(f"Model downloaded to {path}")
            except Exception as e:
                logger.error(f"Failed to download model: {e}")
                raise

    def detect_faces(self, image_bytes: bytes):
        """
        Detects faces and computes 128-d embeddings using SFace (OpenCV).
        No dlib/face_recognition needed.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            return []

        h, w, _ = img_bgr.shape
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # 1. MediaPipe Detection
        face_locations = []
        try:
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            results = self.detector.detect(mp_image)

            if results.detections:
                for detection in results.detections:
                    bbox = detection.bounding_box
                    xmin = bbox.origin_x
                    ymin = bbox.origin_y
                    bw = bbox.width
                    bh = bbox.height

                    margin_x = int(bw * 0.1)
                    margin_y = int(bh * 0.1)

                    top = max(0, ymin - margin_y)
                    bottom = min(h, ymin + bh + margin_y)
                    left = max(0, xmin - margin_x)
                    right = min(w, xmin + bw + margin_x)

                    face_locations.append((top, right, bottom, left))
        except Exception as e:
            logger.error(f"MediaPipe detection failed: {e}")

        # 2. Haar Cascade Fallback
        if not face_locations:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            faces_rect = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
            )
            for (x, y, fw, fh) in faces_rect:
                face_locations.append((y, x + fw, y + fh, x))

        # 3. Compute Embeddings using SFace (OpenCV)
        if face_locations:
            results_final = []
            for loc in face_locations:
                top, right, bottom, left = loc

                face_crop = img_bgr[top:bottom, left:right]
                if face_crop.size == 0:
                    continue

                # SFace expects 112x112 BGR input
                aligned = cv2.resize(face_crop, (112, 112))

                # Get 128-d embedding
                embedding = self.recognizer.feature(aligned)
                embedding = embedding.flatten().tolist()

                results_final.append({
                    "location": list(loc),
                    "embedding": embedding
                })
            return results_final

        return []


face_logic = FaceLogic()
