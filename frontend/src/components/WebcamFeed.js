// src/components/WebcamFeed.js - Backend API version with IP camera support
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

  const detectionIntervalRef = useRef(null);
  const fpsIntervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Load camera settings from localStorage
  useEffect(() => {
    const source = localStorage.getItem('cameraSource') || 'browser';
    const url = localStorage.getItem('cameraUrl') || '';
    setCameraSource(source);
    setCameraUrl(url);
  }, []);

  // Check backend health on mount
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
              if (retry) {
                setError(null);
              }
            }
          }, 5000);
        }
      }
    };
    checkBackend();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  // For IP camera, mark video ready once stream loads
  useEffect(() => {
    if (cameraSource === 'ip' && cameraUrl) {
      // IP camera is "ready" immediately (stream loads in img tag)
      setIsVideoReady(true);
    }
  }, [cameraSource, cameraUrl]);

  // Start/stop detection loop based on readiness
  useEffect(() => {
    if (isActive && !isLoading && isVideoReady && backendConnected) {
      startDetection();
    } else {
      stopDetection();
    }
    return () => stopDetection();
  }, [isActive, isLoading, isVideoReady, backendConnected]);

  const cleanup = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
  };

  const startDetection = () => {
    stopDetection();

    detectionIntervalRef.current = setInterval(() => {
      processFrame();
    }, 500);

    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }
  };

  const processFrame = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      let blob = null;

      if (cameraSource === 'ip' && cameraUrl) {
        // IP Camera: capture frame from <img> via hidden canvas
        const img = imgRef.current;
        if (!img || !img.naturalWidth) {
          isProcessingRef.current = false;
          return;
        }
        const hCanvas = hiddenCanvasRef.current;
        if (!hCanvas) { isProcessingRef.current = false; return; }
        hCanvas.width = img.naturalWidth || 640;
        hCanvas.height = img.naturalHeight || 480;
        const hCtx = hCanvas.getContext('2d');
        hCtx.drawImage(img, 0, 0);
        blob = await new Promise((resolve) => hCanvas.toBlob(resolve, 'image/jpeg', 0.8));
      } else {
        // Browser webcam: capture via react-webcam
        if (!webcamRef.current) { isProcessingRef.current = false; return; }
        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) { isProcessingRef.current = false; return; }
        if (video.videoWidth === 0 || video.videoHeight === 0) { isProcessingRef.current = false; return; }
        const screenshot = webcamRef.current.getScreenshot();
        if (!screenshot) { isProcessingRef.current = false; return; }
        blob = dataURLtoBlob(screenshot);
      }

      if (!blob) { isProcessingRef.current = false; return; }

      const response = await api.processFrame(blob);
      if (!isMountedRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Sync canvas size
      let sourceWidth, sourceHeight;
      if (cameraSource === 'ip' && cameraUrl) {
        const img = imgRef.current;
        sourceWidth = img ? (img.naturalWidth || 640) : 640;
        sourceHeight = img ? (img.naturalHeight || 480) : 480;
      } else {
        const currentVideo = webcamRef.current?.video;
        if (!currentVideo) return;
        sourceWidth = currentVideo.videoWidth;
        sourceHeight = currentVideo.videoHeight;
      }

      if (canvas.width !== sourceWidth || canvas.height !== sourceHeight) {
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (response.faces && response.faces.length > 0) {
        response.faces.forEach(face => {
          const [top, right, bottom, left] = face.location;
          const isKnown = face.name !== 'Unknown';

          ctx.strokeStyle = isKnown ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(left, top, right - left, bottom - top);

          const label = `${face.name} (${Math.round(face.confidence * 100)}%)`;
          ctx.font = 'bold 14px Inter, sans-serif';
          const textWidth = ctx.measureText(label).width;
          ctx.fillStyle = isKnown ? '#22c55e' : '#ef4444';
          ctx.fillRect(left, top - 24, textWidth + 12, 24);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, left + 6, top - 7);
        });

        const mappedFaces = response.faces.map(face => ({
          name: face.name,
          confidence: Math.round(face.confidence * 100),
          timestamp: new Date().toISOString(),
          isUnknown: face.name === 'Unknown',
        }));

        if (onFaceDetected && mappedFaces.length > 0) {
          onFaceDetected(mappedFaces);
        }

        frameCountRef.current++;
      }
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        console.error('Frame processing error:', err.message);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [onFaceDetected, cameraSource, cameraUrl]);

  const handleUserMedia = () => {
    setTimeout(() => setIsVideoReady(true), 500);
  };

  const retryConnection = async () => {
    setError(null);
    setIpStreamError(false);
    setIsLoading(true);
    const healthy = await api.healthCheck();
    setBackendConnected(healthy);
    setIsLoading(false);
    if (!healthy) {
      setError('Still cannot reach the server. Please check that the backend is running.');
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="mr-2 flex-shrink-0" />
          <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={retryConnection}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IP Camera mode
  if (cameraSource === 'ip' && cameraUrl) {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
        <img
          ref={imgRef}
          src={cameraUrl}
          crossOrigin="anonymous"
          alt="IP Camera Stream"
          className="w-full h-auto"
          onError={() => setIpStreamError(true)}
          onLoad={() => setIpStreamError(false)}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        {/* Hidden canvas for frame capture */}
        <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

        {ipStreamError && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center">
            <AlertCircle className="text-red-500 mb-3" size={48} />
            <p className="text-white text-lg mb-2">Cannot load camera stream</p>
            <p className="text-gray-400 text-sm mb-4">Check that the Raspberry Pi / IP camera is running and accessible</p>
            <button
              onClick={() => { setIpStreamError(false); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white text-lg">Connecting to face recognition server...</p>
            <p className="text-gray-400 text-sm mt-2">This may take up to 30 seconds on first load</p>
          </div>
        )}

        {/* Status overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isActive && !isLoading && backendConnected && !ipStreamError
              ? 'bg-green-500 animate-pulse'
              : 'bg-gray-500'
          }`}></div>
          <span className="text-sm font-medium">
            {isLoading ? 'Connecting...' : !backendConnected ? 'Server Offline' : ipStreamError ? 'Stream Error' : isActive ? 'Live (IP Camera)' : 'Paused'}
          </span>
        </div>

        {/* FPS counter */}
        {!isLoading && backendConnected && !ipStreamError && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
            <span className="text-sm font-medium">{fps} FPS</span>
          </div>
        )}
      </div>
    );
  }

  // Browser webcam mode (default)
  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.7}
        videoConstraints={videoConstraints}
        className="w-full h-auto"
        onUserMedia={handleUserMedia}
        onUserMediaError={(err) => {
          console.error('Webcam error:', err);
          setError('Failed to access webcam. Please check permissions.');
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Connecting to face recognition server...</p>
          <p className="text-gray-400 text-sm mt-2">This may take up to 30 seconds on first load</p>
        </div>
      )}

      {!isVideoReady && !isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
          <p className="text-white text-lg">Initializing camera...</p>
        </div>
      )}

      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isActive && !isLoading && isVideoReady && backendConnected
            ? 'bg-green-500 animate-pulse'
            : 'bg-gray-500'
        }`}></div>
        <span className="text-sm font-medium">
          {isLoading ? 'Connecting...' : !backendConnected ? 'Server Offline' : !isVideoReady ? 'Starting...' : isActive ? 'Live' : 'Paused'}
        </span>
      </div>

      {/* FPS counter */}
      {!isLoading && isVideoReady && backendConnected && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
          <span className="text-sm font-medium">{fps} FPS</span>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
