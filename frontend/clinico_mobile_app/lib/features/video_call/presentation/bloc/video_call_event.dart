import 'package:equatable/equatable.dart';

abstract class VideoCallEvent extends Equatable {
  const VideoCallEvent();

  @override
  List<Object?> get props => [];
}

class InitiateCall extends VideoCallEvent {
  final String appointmentId;

  const InitiateCall({required this.appointmentId});

  @override
  List<Object?> get props => [appointmentId];
}

class AcceptCall extends VideoCallEvent {
  final String appointmentId;

  const AcceptCall({required this.appointmentId});

  @override
  List<Object?> get props => [appointmentId];
}

class EndCall extends VideoCallEvent {
  final String appointmentId;

  const EndCall({required this.appointmentId});

  @override
  List<Object?> get props => [appointmentId];
}

class ToggleAudio extends VideoCallEvent {
  final bool isMuted;

  const ToggleAudio({required this.isMuted});

  @override
  List<Object?> get props => [isMuted];
}

class ToggleVideo extends VideoCallEvent {
  final bool isEnabled;

  const ToggleVideo({required this.isEnabled});

  @override
  List<Object?> get props => [isEnabled];
}

class ToggleSpeaker extends VideoCallEvent {
  final bool isEnabled;

  const ToggleSpeaker({required this.isEnabled});

  @override
  List<Object?> get props => [isEnabled];
}

class RemoteStreamReceived extends VideoCallEvent {
  final dynamic stream;

  const RemoteStreamReceived({required this.stream});

  @override
  List<Object?> get props => [stream];
}

class CallError extends VideoCallEvent {
  final String message;

  const CallError({required this.message});

  @override
  List<Object?> get props => [message];
}
