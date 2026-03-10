// src/services/api.js
// API service layer for communicating with the FastAPI backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = {
  /**
   * Send a webcam frame (JPEG blob) to the backend for face recognition.
   * Returns { faces: [{ name, confidence, location, debug }] }
   */
  async processFrame(imageBlob) {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    const res = await fetch(`${API_BASE_URL}/api/v1/webcam/process_frame`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Process frame failed (${res.status}): ${text}`);
    }
    return res.json();
  },

  /**
   * Register a new face with a name and image blob.
   * Returns the saved face record { id, name, created_at, source }.
   */
  async registerFace(name, imageBlob) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', imageBlob, 'face.jpg');
    const res = await fetch(`${API_BASE_URL}/api/v1/faces/register`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  /**
   * Detect faces in an image (returns locations + embeddings).
   * Returns [{ location, embedding }]
   */
  async detectFaces(imageBlob) {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    const res = await fetch(`${API_BASE_URL}/api/v1/faces/detect`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Detection failed: ${res.status}`);
    return res.json();
  },

  /**
   * List all registered faces from the database.
   * Returns [{ id, name, created_at, source }]
   */
  async listFaces() {
    const res = await fetch(`${API_BASE_URL}/api/v1/faces/`);
    if (!res.ok) throw new Error(`List faces failed: ${res.status}`);
    return res.json();
  },

  /**
   * Delete a registered face by ID.
   */
  async deleteFace(faceId) {
    const res = await fetch(`${API_BASE_URL}/api/v1/faces/${faceId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json();
  },

  /**
   * Health check - verify the backend is reachable.
   */
  async healthCheck() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};

/**
 * Helper: convert a base64 data URL to a Blob.
 * Used by components that capture webcam screenshots as data URLs.
 */
export function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

export default api;
