// src/components/WebcamFeed.js - Direct canvas rendering for perfect bbox alignment
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import api, { dataURLtoBlob } from '../services/api';
import { AlertCircle } from 'lucide-react';

const WebcamFeed = ({ onFaceDetected, isActive = true }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraSource, setCameraSource] = useState('browser');
  const [cameraUrl, setCameraUrl] = useState('');
  const [ipStreamError, setIpStreamError] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const detectionIntervalRef = useRef(null);
  const fpsIntervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastFacesRef = useRef([]);

  useEffect(() => {
    const source = localStorage.getItem('cameraSource') || 'browser';
    const url = localStorage.getItem('cameraUrl') || '';
    setCameraSource(source);
    setCameraUrl(url);
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      setIsLoading(true);
      const healthy = await api.healthCheck();
      if (isMountedRef.current) {
        setBackendConnected(healthy);
        setIsLoading(false);
        if (!healthy) {
          setError('Cannot reach the face recognition server. It may be waking up (takes ~30s on free tier). Retrying...');
          setTimeout(async () => {
            const retry = await api.healthCheck();
            if (isMountedRef.current) {
              setBackendConnected(retry);
              if (retry) setError(null);
            }
          }, 5000);
        }
      }
    };
    checkBackend();
    return () => { isMountedRef.current = false; cleanup(); };
  }, []);

  useEffect(() => {
    if (cameraSource === 'ip' && cameraUrl) setIsVideoReady(true);
  }, [cameraSource, cameraUrl]);

  useEffect(() => {
    if (isActive && !isLoading && isVideoReady && backendConnected) {
      startDetection();
      if (cameraSource !== 'ip') startVideoLoop();
    } else {
      stopDetection();
    }
    return () => stopDetection();
  }, [isActive, isLoading, isVideoReady, backendConnected, cameraSource]);

  const cleanup = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
  };

  const startVideoLoop = () => {
    // Continuously draw video + bounding boxes onto canvas for perfect alignment
    const drawLoop = () => {
      if (!isMountedRef.current) return;
      if (cameraSource === 'ip') return;

      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        requestAnimationFrame(drawLoop);
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw === 0 || vh === 0) {
        requestAnimationFrame(drawLoop);
        return;
      }

      // Match canvas to display size
      const dw = video.clientWidth;
      const dh = video.clientHeight;
      if (canvas.width !== dw || canvas.height !== dh) {
        canvas.width = dw;
        canvas.height = dh;
      }

      const ctx = canvas.getContext('2d');
      // Clear canvas - video is visible underneath, canvas only draws bounding boxes
      ctx.clearRect(0, 0, dw, dh);

      // Draw bounding boxes from last detection
      const scaleX = dw / vw;
      const scaleY = dh / vh;

      lastFacesRef.current.forEach(face => {
        const [top, right, bottom, left] = face.location;
        const isKnown = face.name !== 'Unknown';

        const dLeft = left * scaleX;
        const dTop = top * scaleY;
        const dRight = right * scaleX;
        const dBottom = bottom * scaleY;

        ctx.strokeStyle = isKnown ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(dLeft, dTop, dRight - dLeft, dBottom - dTop);

        const label = face.name + ' (' + Math.round(face.confidence * 100) + '%)';
        ctx.font = 'bold 14px Inter, sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = isKnown ? '#22c55e' : '#ef4444';
        ctx.fillRect(dLeft, dTop - 24, tw + 12, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, dLeft + 6, dTop - 7);
      });

      requestAnimationFrame(drawLoop);
    };
    requestAnimationFrame(drawLoop);
  };

  const startDetection = () => {
    stopDetection();
    detectionIntervalRef.current = setInterval(() => { processFrame(); }, 500);
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) { clearInterval(detectionIntervalRef.current); detectionIntervalRef.current = null; }
    if (fpsIntervalRef.current) { clearInterval(fpsIntervalRef.current); fpsIntervalRef.current = null; }
  };

  const processFrame = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      let blob = null;
      let nativeWidth, nativeHeight;

      if (cameraSource === 'ip' && cameraUrl) {
        const img = imgRef.current;
        if (!img || !img.naturalWidth) { isProcessingRef.current = false; return; }
        const hCanvas = hiddenCanvasRef.current;
        if (!hCanvas) { isProcessingRef.current = false; return; }
        nativeWidth = img.naturalWidth;
        nativeHeight = img.naturalHeight;
        hCanvas.width = nativeWidth;
        hCanvas.height = nativeHeight;
        const hCtx = hCanvas.getContext('2d');
        hCtx.drawImage(img, 0, 0);
        blob = await new Promise((resolve) => hCanvas.toBlob(resolve, 'image/jpeg', 0.8));
      } else {
        if (!webcamRef.current) { isProcessingRef.current = false; return; }
        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) { isProcessingRef.current = false; return; }
        nativeWidth = video.videoWidth;
        nativeHeight = video.videoHeight;
        if (nativeWidth === 0 || nativeHeight === 0) { isProcessingRef.current = false; return; }
        // Capture directly from video at native resolution
        const hCanvas = hiddenCanvasRef.current || document.createElement('canvas');
        hCanvas.width = nativeWidth;
        hCanvas.height = nativeHeight;
        const hCtx = hCanvas.getContext('2d');
        hCtx.drawImage(video, 0, 0, nativeWidth, nativeHeight);
        blob = await new Promise((resolve) => hCanvas.toBlob(resolve, 'image/jpeg', 0.85));
      }

      if (!blob) { isProcessingRef.current = false; return; }

      const response = await api.processFrame(blob);
      if (!isMountedRef.current) return;

      if (response.faces && response.faces.length > 0) {
        lastFacesRef.current = response.faces;

        // For IP camera mode, draw on canvas overlay
        if (cameraSource === 'ip' && cameraUrl) {
          const canvas = canvasRef.current;
          const img = imgRef.current;
          if (canvas && img) {
            const dw = img.clientWidth;
            const dh = img.clientHeight;
            if (canvas.width !== dw || canvas.height !== dh) {
              canvas.width = dw;
              canvas.height = dh;
            }
            const scaleX = dw / nativeWidth;
            const scaleY = dh / nativeHeight;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, dw, dh);

            response.faces.forEach(face => {
              const [top, right, bottom, left] = face.location;
              const isKnown = face.name !== 'Unknown';
              const dLeft = left * scaleX;
              const dTop = top * scaleY;
              const dRight = right * scaleX;
              const dBottom = bottom * scaleY;

              ctx.strokeStyle = isKnown ? '#22c55e' : '#ef4444';
              ctx.lineWidth = 3;
              ctx.strokeRect(dLeft, dTop, dRight - dLeft, dBottom - dTop);

              const label = face.name + ' (' + Math.round(face.confidence * 100) + '%)';
              ctx.font = 'bold 14px Inter, sans-serif';
              const tw = ctx.measureText(label).width;
              ctx.fillStyle = isKnown ? '#22c55e' : '#ef4444';
              ctx.fillRect(dLeft, dTop - 24, tw + 12, 24);
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, dLeft + 6, dTop - 7);
            });
          }
        }

        const f = response.faces[0];
        const scoresStr = f.debug_scores ? Object.entries(f.debug_scores).map(([k,v]) => k + '=' + v).join(' ') : 'no known faces';
        setDebugInfo('scores: [' + scoresStr + '] norm=' + (f.debug_embedding_norm || '?'));

        const mappedFaces = response.faces.map(face => ({
          name: face.name,
          confidence: Math.round(face.confidence * 100),
          timestamp: new Date().toISOString(),
          isUnknown: face.name === 'Unknown',
        }));

        if (onFaceDetected && mappedFaces.length > 0) onFaceDetected(mappedFaces);
        frameCountRef.current++;
      } else {
        lastFacesRef.current = [];
        setDebugInfo('No faces detected');
        // Clear IP camera overlay
        if (cameraSource === 'ip') {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        console.error('Frame processing error:', err.message);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [onFaceDetected, cameraSource, cameraUrl]);

  const handleUserMedia = () => { setTimeout(() => setIsVideoReady(true), 500); };

  const retryConnection = async () => {
    setError(null); setIpStreamError(false); setIsLoading(true);
    const healthy = await api.healthCheck();
    setBackendConnected(healthy); setIsLoading(false);
    if (!healthy) setError('Still cannot reach the server.');
  };

  const videoConstraints = { width: 1280, height: 720, facingMode: 'user' };

  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="mr-2 flex-shrink-0" />
          <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-sm">{error}</p>
            <button onClick={retryConnection} className="mt-2 text-sm underline hover:no-underline">Retry Connection</button>
          </div>
        </div>
      </div>
    );
  }

  // IP Camera mode
  if (cameraSource === 'ip' && cameraUrl) {
    return (
      <div className="relative bg-black rounded-xl overflow-hidden">
        <img ref={imgRef} src={cameraUrl} crossOrigin="anonymous" alt="IP Camera" className="w-full h-auto"
          onError={() => setIpStreamError(true)} onLoad={() => setIpStreamError(false)} />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
        {ipStreamError && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
            <AlertCircle className="text-red-500 mb-3" size={48} />
            <p className="text-white text-lg mb-2">Cannot load camera stream</p>
            <button onClick={() => setIpStreamError(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700">Retry</button>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p className="text-white">Connecting...</p>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isActive && !isLoading && backendConnected && !ipStreamError ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}></div>
          <span>{isLoading ? 'Connecting...' : !backendConnected ? 'Offline' : ipStreamError ? 'Error' : isActive ? 'Live (IP)' : 'Paused'}</span>
        </div>
        {!isLoading && backendConnected && !ipStreamError && (
          <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">{fps} FPS</div>
        )}
        {debugInfo && (
          <div className="absolute bottom-4 left-4 bg-black/80 text-yellow-300 px-3 py-1 rounded text-xs font-mono">{debugInfo}</div>
        )}
      </div>
    );
  }

  // Browser webcam mode - video visible, canvas overlays bounding boxes
  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.85}
        videoConstraints={videoConstraints}
        className="w-full h-auto"
        onUserMedia={handleUserMedia}
        onUserMediaError={(err) => { console.error('Webcam error:', err); setError('Failed to access webcam.'); }}
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white">Connecting to server...</p>
        </div>
      )}
      {!isVideoReady && !isLoading && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
          <p className="text-white">Initializing camera...</p>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isActive && !isLoading && isVideoReady && backendConnected ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}></div>
        <span>{isLoading ? 'Connecting...' : !backendConnected ? 'Offline' : !isVideoReady ? 'Starting...' : isActive ? 'Live' : 'Paused'}</span>
      </div>
      {!isLoading && isVideoReady && backendConnected && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">{fps} FPS</div>
      )}
      {debugInfo && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-yellow-300 px-3 py-1 rounded text-xs font-mono">{debugInfo}</div>
      )}
    </div>
  );
};

export default WebcamFeed;
