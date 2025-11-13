import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:bloc_concurrency/bloc_concurrency.dart';
import 'ai_chat_event.dart';
import 'ai_chat_state.dart';
import 'package:uuid/uuid.dart';
import '../../data/repositories/ai_service.dart';

class AIChatBloc extends Bloc<AIChatEvent, AIChatState> {
  final _uuid = const Uuid();
  final _aiService = AIService();
  final List<AIChatMessage> _messageHistory = [];

  AIChatBloc() : super(AIChatInitial()) {
    on<LoadAIChatHistory>(_onLoadHistory);
    on<SendMessage>(_onSendMessage);
    on<StartVoiceInput>(_onStartVoiceInput);
    on<StopVoiceInput>(_onStopVoiceInput);
    on<ClearChat>(_onClearChat);
    on<TypingStatusChanged>(_onTypingStatusChanged);
  }

  void _onLoadHistory(
    LoadAIChatHistory event,
    Emitter<AIChatState> emit,
  ) async {
    emit(AIChatLoading());
    try {
      // TODO: Load chat history from local storage or API
      emit(const AIChatMessagesLoaded(messages: []));
    } catch (e) {
      emit(AIChatError(e.toString()));
    }
  }

  void _onSendMessage(SendMessage event, Emitter<AIChatState> emit) async {
    if (state is AIChatMessagesLoaded) {
      final currentState = state as AIChatMessagesLoaded;

      // Add user message
      final userMessage = AIChatMessage(
        id: _uuid.v4(),
        content: event.message,
        isUserMessage: true,
        timestamp: DateTime.now(),
      );

      _messageHistory.add(userMessage);

      emit(
        currentState.copyWith(messages: [..._messageHistory], isTyping: true),
      );

      try {
        // Check if it's an emergency case
        final isEmergency = await _aiService.isEmergencyCase(event.message);

        String aiResponseContent;
        if (isEmergency) {
          aiResponseContent = '''
IMPORTANT: Your message suggests this might be a medical emergency.

If you're experiencing:
- Severe chest pain or difficulty breathing
- Sudden severe headache or confusion
- Severe abdominal pain
- Uncontrolled bleeding

Please:
1. Call emergency services immediately (911)
2. Visit the nearest emergency room
3. Don't wait for AI responses in emergency situations

Would you like me to:
1. Help you locate the nearest emergency room?
2. Connect you with a doctor immediately?
3. Provide basic first aid information while you wait for help?
''';
        } else {
          // Get AI response
          aiResponseContent = await _aiService.generateResponse(event.message);

          // If it's a medical query, also get specific medical advice
          if (event.message.toLowerCase().contains('pain') ||
              event.message.toLowerCase().contains('symptoms') ||
              event.message.toLowerCase().contains('treatment')) {
            final medicalAdvice = await _aiService.generateMedicalAdvice(
              event.message,
            );
            aiResponseContent +=
                '''

Medical Advisory Note:
$medicalAdvice

Please note: This is AI-generated advice and should not replace professional medical consultation.''';
          }
        }

        // Create AI response message
        final aiResponse = AIChatMessage(
          id: _uuid.v4(),
          content: aiResponseContent,
          isUserMessage: false,
          timestamp: DateTime.now(),
        );

        _messageHistory.add(aiResponse);

        emit(
          currentState.copyWith(
            messages: [..._messageHistory],
            isTyping: false,
          ),
        );
      } catch (e) {
        // Add error message to chat
        final errorMessage = AIChatMessage(
          id: _uuid.v4(),
          content:
              "I apologize, but I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
          isUserMessage: false,
          timestamp: DateTime.now(),
        );

        _messageHistory.add(errorMessage);

        emit(
          currentState.copyWith(
            messages: [..._messageHistory],
            isTyping: false,
          ),
        );
      }
    }
  }

  void _onStartVoiceInput(StartVoiceInput event, Emitter<AIChatState> emit) {
    // TODO: Implement voice input start
  }

  void _onStopVoiceInput(StopVoiceInput event, Emitter<AIChatState> emit) {
    if (event.transcribedText != null) {
      add(SendMessage(event.transcribedText!));
    }
  }

  void _onClearChat(ClearChat event, Emitter<AIChatState> emit) {
    emit(const AIChatMessagesLoaded(messages: []));
  }

  void _onTypingStatusChanged(
    TypingStatusChanged event,
    Emitter<AIChatState> emit,
  ) {
    if (state is AIChatMessagesLoaded) {
      final currentState = state as AIChatMessagesLoaded;
      emit(currentState.copyWith(isTyping: event.isTyping));
    }
  }
}
