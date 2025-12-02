import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import ControlPanel from '../components/ControlPanel';
import signalingService from '../services/signalingService';
import axios from 'axios';
import Peer from 'simple-peer';

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState('connecting');
  
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);

  // Validate room access
  useEffect(() => {
    const validateRoom = async () => {
      await validateRoomAccess();
    };
    validateRoom();
  }, [roomId]);

  const validateRoomAccess = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Authentication token not found. Please log in again.');
        navigate('/');
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/signaling/validate/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.data.is_valid) {
        setIsValidRoom(true);
        setUserRole(response.data.data.role);
        setUserName(response.data.data.identity_name);
        initializeMedia();
      } else {
        alert('You are not authorized to join this room');
        navigate('/');
      }
    } catch (error) {
      console.error('Room validation failed:', error);
      alert('Invalid room or access denied');
      navigate('/');
    }
  };

  // Initialize media devices
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to signaling server
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
      await signalingService.connect(socketUrl);
      signalingService.joinRoom(roomId, {
        role: userRole,
        name: userName
      });

      setupPeerConnection(stream);
      setConnectionState('connected');

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Camera/Microphone access denied');
    }
  };

  // Setup WebRTC peer connection
  const setupPeerConnection = (stream) => {
    signalingService.onUserJoined((data) => {
      // Create peer connection for new user
      const peer = new Peer({
        initiator: userRole === 'Doctor', // Doctor initiates
        trickle: false,
        stream: stream
      });

      peer.on('signal', (signal) => {
        signalingService.sendSignal(signal, data.userId);
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
      });

      peerRef.current = peer;
    });

    signalingService.onSignal((data) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    signalingService.onUserLeft(() => {
      setRemoteStream(null);
      setConnectionState('disconnected');
    });
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // End call
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    signalingService.leaveRoom();
    navigate('/');
  };

  if (!isValidRoom) {
    return <div>Validating access...</div>;
  }

  return (
    <div className="video-room-container">
      <div className="video-grid">
        <VideoPlayer
          stream={localStream}
          muted={true}
          label={`${userName} (You)`}
          isVideoEnabled={isVideoEnabled}
        />
        <VideoPlayer
          stream={remoteStream}
          muted={false}
          label={remoteStream ? 'Remote User' : 'Waiting for participant...'}
          isVideoEnabled={remoteStream !== null}
        />
      </div>
      
      <ControlPanel
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
        connectionState={connectionState}
      />
    </div>
  );
};

export default VideoRoom;