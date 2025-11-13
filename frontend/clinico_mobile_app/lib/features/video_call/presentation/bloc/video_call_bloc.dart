import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import './video_call_event.dart';
import './video_call_state.dart';

class VideoCallBloc extends Bloc<VideoCallEvent, VideoCallState> {
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;
  final Map<String, dynamic> _configuration = {
    'iceServers': [
      {
        'urls': ['stun:stun1.l.google.com:19302'],
      },
    ],
  };

  VideoCallBloc() : super(const VideoCallState()) {
    on<InitiateCall>(_onInitiateCall);
    on<AcceptCall>(_onAcceptCall);
    on<EndCall>(_onEndCall);
    on<ToggleAudio>(_onToggleAudio);
    on<ToggleVideo>(_onToggleVideo);
    on<ToggleSpeaker>(_onToggleSpeaker);
    on<RemoteStreamReceived>(_onRemoteStreamReceived);
    on<CallError>(_onCallError);
  }

  Future<void> _onInitiateCall(
    InitiateCall event,
    Emitter<VideoCallState> emit,
  ) async {
    try {
      emit(
        state.copyWith(
          status: CallStatus.connecting,
          appointmentId: event.appointmentId,
        ),
      );

      await _initializeWebRTC();
      await _createOffer();

      emit(
        state.copyWith(status: CallStatus.connected, localStream: _localStream),
      );
    } catch (e) {
      emit(
        state.copyWith(status: CallStatus.error, errorMessage: e.toString()),
      );
    }
  }

  Future<void> _onAcceptCall(
    AcceptCall event,
    Emitter<VideoCallState> emit,
  ) async {
    try {
      emit(
        state.copyWith(
          status: CallStatus.connecting,
          appointmentId: event.appointmentId,
        ),
      );

      await _initializeWebRTC();
      await _createAnswer();

      emit(
        state.copyWith(status: CallStatus.connected, localStream: _localStream),
      );
    } catch (e) {
      emit(
        state.copyWith(status: CallStatus.error, errorMessage: e.toString()),
      );
    }
  }

  Future<void> _onEndCall(EndCall event, Emitter<VideoCallState> emit) async {
    await _disposeWebRTC();
    emit(const VideoCallState());
  }

  void _onToggleAudio(ToggleAudio event, Emitter<VideoCallState> emit) {
    if (_localStream != null) {
      final audioTrack = _localStream!.getAudioTracks().first;
      audioTrack.enabled = !event.isMuted;
      emit(state.copyWith(isAudioMuted: event.isMuted));
    }
  }

  void _onToggleVideo(ToggleVideo event, Emitter<VideoCallState> emit) {
    if (_localStream != null) {
      final videoTrack = _localStream!.getVideoTracks().first;
      videoTrack.enabled = event.isEnabled;
      emit(state.copyWith(isVideoEnabled: event.isEnabled));
    }
  }

  void _onToggleSpeaker(ToggleSpeaker event, Emitter<VideoCallState> emit) {
    // TODO: Implement speaker toggle using WebRTC audio output device selection
    emit(state.copyWith(isSpeakerEnabled: event.isEnabled));
  }

  void _onRemoteStreamReceived(
    RemoteStreamReceived event,
    Emitter<VideoCallState> emit,
  ) {
    emit(state.copyWith(remoteStream: event.stream));
  }

  void _onCallError(CallError event, Emitter<VideoCallState> emit) {
    emit(state.copyWith(status: CallStatus.error, errorMessage: event.message));
  }

  Future<void> _initializeWebRTC() async {
    _peerConnection = await createPeerConnection(_configuration);

    _localStream = await navigator.mediaDevices.getUserMedia({
      'audio': true,
      'video': {'facingMode': 'user'},
    });

    _localStream!.getTracks().forEach((track) {
      _peerConnection!.addTrack(track, _localStream!);
    });

    _peerConnection!.onTrack = (RTCTrackEvent event) {
      if (event.streams.isNotEmpty) {
        add(RemoteStreamReceived(stream: event.streams[0]));
      }
    };

    _peerConnection!.onIceCandidate = (RTCIceCandidate candidate) {
      // TODO: Send ice candidate to signaling server
    };

    _peerConnection!.onIceConnectionState = (RTCIceConnectionState state) {
      if (state == RTCIceConnectionState.RTCIceConnectionStateDisconnected) {
        add(const CallError(message: 'Connection lost'));
      }
    };
  }

  Future<void> _createOffer() async {
    try {
      RTCSessionDescription offer = await _peerConnection!.createOffer();
      await _peerConnection!.setLocalDescription(offer);
      // TODO: Send offer to signaling server
    } catch (e) {
      add(CallError(message: e.toString()));
    }
  }

  Future<void> _createAnswer() async {
    try {
      RTCSessionDescription answer = await _peerConnection!.createAnswer();
      await _peerConnection!.setLocalDescription(answer);
      // TODO: Send answer to signaling server
    } catch (e) {
      add(CallError(message: e.toString()));
    }
  }

  Future<void> _disposeWebRTC() async {
    await _localStream?.dispose();
    await _peerConnection?.close();
    _localStream = null;
    _peerConnection = null;
  }

  @override
  Future<void> close() async {
    await _disposeWebRTC();
    return super.close();
  }
}
