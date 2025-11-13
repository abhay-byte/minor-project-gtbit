import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/ai_chat_bloc.dart';
import '../bloc/ai_chat_event.dart';
import '../constants/ai_chat_constants.dart';

class ChatInputWidget extends StatefulWidget {
  const ChatInputWidget({super.key});

  @override
  State<ChatInputWidget> createState() => _ChatInputWidgetState();
}

class _ChatInputWidgetState extends State<ChatInputWidget> {
  final TextEditingController _controller = TextEditingController();
  bool _isRecording = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleSendMessage() {
    final message = _controller.text.trim();
    if (message.isNotEmpty) {
      context.read<AIChatBloc>().add(SendMessage(message));
      _controller.clear();
    }
  }

  void _toggleVoiceInput() {
    setState(() {
      _isRecording = !_isRecording;
    });
    if (_isRecording) {
      context.read<AIChatBloc>().add(const StartVoiceInput());
    } else {
      context.read<AIChatBloc>().add(const StopVoiceInput());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 34),
      height: 107,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: const Color(0xFFE1E1E1)),
      ),
      child: Row(
        children: [
          // Voice Input Button
          InkWell(
            onTap: _toggleVoiceInput,
            child: Container(
              padding: const EdgeInsets.all(12),
              child: Image.asset(
                AIChatAssets.micIcon,
                width: 20,
                height: 20,
                color: _isRecording ? Theme.of(context).primaryColor : null,
              ),
            ),
          ),

          // Text Input
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: AIChatStrings.inputHint,
                hintStyle: const TextStyle(
                  color: Color(0xFFA3A3A8),
                  fontSize: 16,
                  letterSpacing: 0.2,
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
              ),
              onSubmitted: (_) => _handleSendMessage(),
            ),
          ),

          // Send Button
          InkWell(
            onTap: _handleSendMessage,
            child: Container(
              width: 30,
              height: 30,
              margin: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Color(0xFFE5E5E5),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Image.asset(
                  AIChatAssets.sendIcon,
                  width: 15,
                  height: 15,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
