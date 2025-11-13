import 'package:equatable/equatable.dart';

abstract class AIChatEvent extends Equatable {
  const AIChatEvent();

  @override
  List<Object?> get props => [];
}

class LoadAIChatHistory extends AIChatEvent {
  const LoadAIChatHistory();
}

class SendMessage extends AIChatEvent {
  final String message;

  const SendMessage(this.message);

  @override
  List<Object?> get props => [message];
}

class StartVoiceInput extends AIChatEvent {
  const StartVoiceInput();
}

class StopVoiceInput extends AIChatEvent {
  final String? transcribedText;

  const StopVoiceInput([this.transcribedText]);

  @override
  List<Object?> get props => [transcribedText];
}

class ClearChat extends AIChatEvent {
  const ClearChat();
}

class TypingStatusChanged extends AIChatEvent {
  final bool isTyping;

  const TypingStatusChanged(this.isTyping);

  @override
  List<Object?> get props => [isTyping];
}
