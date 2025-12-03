import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  connectionState
}) => {
  return (
    <div className="control-panel">
      <div className="connection-status">
        Status: <span className={`status-${connectionState}`}>{connectionState}</span>
      </div>
      
      <div className="controls">
        <button
          className={`control-btn ${isAudioEnabled ? 'active' : 'inactive'}`}
          onClick={onToggleAudio}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          <span className="icon">{isAudioEnabled ? '🎤' : '🔇'}</span>
          <span className="label">{isAudioEnabled ? 'Mute' : 'Unmute'}</span>
        </button>

        <button
          className={`control-btn ${isVideoEnabled ? 'active' : 'inactive'}`}
          onClick={onToggleVideo}
          title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        >
          <span className="icon">{isVideoEnabled ? '📹' : '📷'}</span>
          <span className="label">{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
        </button>

        <button
          className="control-btn end-call"
          onClick={onEndCall}
          title="End Call"
        >
          <span className="icon">📞</span>
          <span className="label">End Call</span>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;