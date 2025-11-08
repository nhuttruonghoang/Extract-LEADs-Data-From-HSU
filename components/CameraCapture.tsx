
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { Spinner } from './Spinner';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    startStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const { videoWidth, videoHeight } = videoRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
        canvasRef.current.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-2xl mx-4 border border-gray-700 relative">
        <h3 className="text-lg font-medium text-gray-200 mb-4 text-center">Camera Capture</h3>
        <div className="bg-black rounded-md overflow-hidden relative aspect-video">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                onCanPlay={handleCanPlay}
                className="w-full h-full object-contain"
            />
            {isLoading && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50">
                    <Spinner />
                    <p className="text-white mt-2">Starting camera...</p>
                </div>
            )}
            {error && (
                 <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 p-4">
                    <p className="text-red-400 text-center">{error}</p>
                </div>
            )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            type="button"
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="group w-20 h-20 rounded-full bg-white/20 p-2 flex justify-center items-center transition hover:bg-white/30 disabled:opacity-50"
            onClick={handleCapture}
            disabled={isLoading || !!error}
          >
            <div className="w-full h-full rounded-full bg-red-500 group-hover:bg-red-600 transition ring-2 ring-offset-4 ring-offset-gray-800 ring-transparent group-focus:ring-blue-500"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
