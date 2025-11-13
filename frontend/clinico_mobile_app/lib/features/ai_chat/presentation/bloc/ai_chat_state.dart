import 'package:equatable/equatable.dart';

abstract class AIChatState extends Equatable {
  const AIChatState();

  @override
  List<Object?> get props => [];
}

class AIChatInitial extends AIChatState {}

class AIChatLoading extends AIChatState {}

class AIChatMessageSending extends AIChatState {}

class AIChatError extends AIChatState {
  final String message;

  const AIChatError(this.message);

  @override
  List<Object?> get props => [message];
}

class AIChatMessagesLoaded extends AIChatState {
  final List<AIChatMessage> messages;
  final bool isTyping;

  const AIChatMessagesLoaded({required this.messages, this.isTyping = false});

  @override
  List<Object?> get props => [messages, isTyping];

  AIChatMessagesLoaded copyWith({
    List<AIChatMessage>? messages,
    bool? isTyping,
  }) {
    return AIChatMessagesLoaded(
      messages: messages ?? this.messages,
      isTyping: isTyping ?? this.isTyping,
    );
  }
}

class AIChatMessage extends Equatable {
  final String id;
  final String content;
  final bool isUserMessage;
  final DateTime timestamp;

  const AIChatMessage({
    required this.id,
    required this.content,
    required this.isUserMessage,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [id, content, isUserMessage, timestamp];
}
