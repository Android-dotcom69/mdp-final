import cv2
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FaceLogic:
    def __init__(self):
        service_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.abspath(os.path.join(service_dir, "..", "..", "models"))
        os.makedirs(models_dir, exist_ok=True)

        # --- YuNet Face Detection (pairs perfectly with SFace alignCrop) ---
        self.yunet_model_path = os.path.join(models_dir, "face_detection_yunet_2023mar.onnx")
        self._download_if_missing(
            self.yunet_model_path,
            "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
        )

        # --- SFace Face Recognition (128-d embeddings) ---
        self.sface_model_path = os.path.join(models_dir, "face_recognition_sface_2021dec.onnx")
        self._download_if_missing(
            self.sface_model_path,
            "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
        )
        self.recognizer = cv2.FaceRecognizerSF.create(self.sface_model_path, "")

        logger.info("FaceLogic initialized (YuNet + SFace)")

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
        Detects faces using YuNet and computes 128-d embeddings using SFace.
        Uses alignCrop() for proper face alignment — critical for recognition accuracy.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            return []

        h, w, _ = img_bgr.shape

        # Create YuNet detector sized for this image
        detector = cv2.FaceDetectorYN.create(
            self.yunet_model_path, "", (w, h),
            score_threshold=0.5, nms_threshold=0.3, top_k=10
        )

        _, faces = detector.detect(img_bgr)

        if faces is None or len(faces) == 0:
            return []

        results = []
        for face in faces:
            try:
                # alignCrop uses facial landmarks from YuNet to properly align the face
                # This is critical — without it, embeddings are inconsistent
                aligned = self.recognizer.alignCrop(img_bgr, face)

                # Get 128-d L2-normalized embedding
                embedding = self.recognizer.feature(aligned)
                embedding = embedding.flatten().tolist()

                # Convert YuNet bbox [x, y, w, h, ...] to [top, right, bottom, left]
                x, y, bw, bh = int(face[0]), int(face[1]), int(face[2]), int(face[3])
                top = max(0, y)
                right = min(w, x + bw)
                bottom = min(h, y + bh)
                left = max(0, x)

                results.append({
                    "location": [top, right, bottom, left],
                    "embedding": embedding
                })
            except Exception as e:
                logger.error(f"Error processing face: {e}")
                continue

        return results


face_logic = FaceLogic()
