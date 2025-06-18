import React, { useState, useEffect, useRef } from 'react';

  const Webcam = () => {
    const videoRef = useRef(null);
    const [hasCamera, setHasCamera] = useState(false);

    useEffect(() => {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCamera(true);
          }
        } catch (err) {
          console.error('Error accessing webcam:', err);
          alert('Cannot access webcam. Please check permissions.');
        }
      };

      startCamera();

      const videoElement = videoRef.current;
      return () => {
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }, []);

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Webcam</h2>
        {hasCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-lg border rounded"
          />
        ) : (
          <p className="text-red-500">Loading webcam... or permission denied.</p>
        )}
      </div>
    );
  };

  export default Webcam;