import 'package:equatable/equatable.dart';

enum CallStatus { idle, connecting, connected, disconnected, error }

class VideoCallState extends Equatable {
  final CallStatus status;
  final bool isAudioMuted;
  final bool isVideoEnabled;
  final bool isSpeakerEnabled;
  final String? errorMessage;
  final dynamic localStream;
  final dynamic remoteStream;
  final String? appointmentId;

  const VideoCallState({
    this.status = CallStatus.idle,
    this.isAudioMuted = false,
    this.isVideoEnabled = true,
    this.isSpeakerEnabled = true,
    this.errorMessage,
    this.localStream,
    this.remoteStream,
    this.appointmentId,
  });

  VideoCallState copyWith({
    CallStatus? status,
    bool? isAudioMuted,
    bool? isVideoEnabled,
    bool? isSpeakerEnabled,
    String? errorMessage,
    dynamic localStream,
    dynamic remoteStream,
    String? appointmentId,
  }) {
    return VideoCallState(
      status: status ?? this.status,
      isAudioMuted: isAudioMuted ?? this.isAudioMuted,
      isVideoEnabled: isVideoEnabled ?? this.isVideoEnabled,
      isSpeakerEnabled: isSpeakerEnabled ?? this.isSpeakerEnabled,
      errorMessage: errorMessage ?? this.errorMessage,
      localStream: localStream ?? this.localStream,
      remoteStream: remoteStream ?? this.remoteStream,
      appointmentId: appointmentId ?? this.appointmentId,
    );
  }

  @override
  List<Object?> get props => [
    status,
    isAudioMuted,
    isVideoEnabled,
    isSpeakerEnabled,
    errorMessage,
    localStream,
    remoteStream,
    appointmentId,
  ];
}
