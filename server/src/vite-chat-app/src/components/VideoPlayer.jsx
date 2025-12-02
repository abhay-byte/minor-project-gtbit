import React, { useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ stream, muted, label, isVideoEnabled }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-player">
      <div className="video-wrapper">
        {stream && isVideoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="video-element"
          />
        ) : (
          <div className="video-placeholder">
            <div className="avatar">
              {label.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="video-label">{label}</div>
      </div>
    </div>
  );
};

export default VideoPlayer;