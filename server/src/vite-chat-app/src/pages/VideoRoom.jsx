import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import ControlPanel from '../components/ControlPanel';
import signalingService from '../services/signalingService';
import axios from 'axios';
import Peer from 'simple-peer';
import './VideoRoom.css';

const VideoRoom = () => {
  const { roomId } = useParams();
 const navigate = useNavigate();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [remoteName, setRemoteName] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState('connecting');
  
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketConnectedRef = useRef(false);

  // Validate room access
  useEffect(() => {
    validateRoomAccess();
  }, [roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      signalingService.leaveRoom();
    };
  }, []);

  const validateRoomAccess = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/signaling/validate/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      console.log('Validation response:', response.data);

      if (response.data.data.is_valid) {
        setIsValidRoom(true);
        setUserRole(response.data.data.role);
        setUserName(response.data.data.identity_name);
        
        // Initialize media after successful validation
        await initializeMedia(response.data.data.role);
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

  const initializeMedia = async (role) => {
    try {
      console.log('Initializing media devices...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      console.log('Media devices accessed successfully');
      setLocalStream(stream);
      localStreamRef.current = stream;

      // Connect to signaling server
      console.log('Connecting to signaling server...');
      await signalingService.connect(import.meta.env.VITE_API_URL);
      socketConnectedRef.current = true;
      
      console.log('Joining room:', roomId, 'as', role);
      signalingService.joinRoom(roomId, {
        role: role,
        name: userName
      });

      setupSignalingListeners(stream, role);
      setConnectionState('waiting');

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Camera/Microphone access denied. Please enable permissions.');
      navigate('/');
    }
  };

  const setupSignalingListeners = (stream, role) => {
    console.log('Setting up signaling listeners...');

    // When another user joins
    signalingService.onUserJoined((data) => {
      console.log('User joined:', data);
      setRemoteName(data.userData?.name || 'Remote User');
      
      // Create peer connection as initiator (Doctor initiates)
      const shouldInitiate = role === 'Doctor';
      console.log('Creating peer connection, initiator:', shouldInitiate);
      
      createPeerConnection(stream, shouldInitiate, data.userId);
    });

    // When user already in room (for late joiners)
    signalingService.onUserAlreadyInRoom((data) => {
      console.log('User already in room:', data);
      
      // Create peer connection as non-initiator (Patient doesn't initiate)
      const shouldInitiate = role === 'Doctor';
      console.log('Creating peer connection for existing user, initiator:', shouldInitiate);
      
      createPeerConnection(stream, shouldInitiate, data.userId);
    });

    // When receiving WebRTC signal
    signalingService.onSignal((data) => {
      console.log('Received signal from:', data.from);
      
      if (peerRef.current) {
        console.log('Processing signal...');
        peerRef.current.signal(data.signal);
      } else {
        console.warn('Received signal but peer not initialized');
      }
    });

    // When user leaves
    signalingService.onUserLeft((userId) => {
      console.log('User left:', userId);
      setRemoteStream(null);
      setRemoteName('');
      setConnectionState('disconnected');
      
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    });
  };

  const createPeerConnection = (stream, initiator, remoteUserId) => {
    try {
      console.log('Creating peer connection...', { initiator, remoteUserId });

      // Destroy existing peer if any
      if (peerRef.current) {
        console.log('Destroying existing peer connection');
        peerRef.current.destroy();
      }

      const peer = new Peer({
        initiator: initiator,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (signal) => {
        console.log('Sending signal to:', remoteUserId);
        signalingService.sendSignal(signal, remoteUserId);
      });

      peer.on('stream', (remoteStream) => {
        console.log('✅ Received remote stream!');
        setRemoteStream(remoteStream);
        setConnectionState('connected');
      });

      peer.on('connect', () => {
        console.log('✅ Peer connection established');
        setConnectionState('connected');
      });

      peer.on('error', (err) => {
        console.error('❌ Peer connection error:', err);
        setConnectionState('error');
      });

      peer.on('close', () => {
        console.log('Peer connection closed');
        setConnectionState('disconnected');
      });

      peerRef.current = peer;

    } catch (error) {
      console.error('Failed to create peer connection:', error);
      setConnectionState('error');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
 };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    signalingService.leaveRoom();
    navigate('/appointments');
  };

  if (!isValidRoom) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Validating access...</p>
      </div>
    );
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
          label={remoteStream ? (remoteName || 'Remote User') : 'Waiting for participant...'}
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