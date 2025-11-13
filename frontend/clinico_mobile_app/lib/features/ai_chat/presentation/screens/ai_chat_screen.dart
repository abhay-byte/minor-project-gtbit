import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/ai_chat_bloc.dart';
import '../bloc/ai_chat_event.dart';
import '../bloc/ai_chat_state.dart';
import '../constants/ai_chat_constants.dart';
import '../widgets/chat_input_widget.dart';
import '../widgets/chat_message_widget.dart';

class AIChatScreen extends StatelessWidget {
  const AIChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AIChatBloc()..add(const LoadAIChatHistory()),
      child: const AIChatView(),
    );
  }
}

class AIChatView extends StatelessWidget {
  const AIChatView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: SafeArea(
        child: BlocBuilder<AIChatBloc, AIChatState>(
          builder: (context, state) {
            return Stack(
              children: [
                // Header
                Positioned(
                  top: 8,
                  left: 16,
                  right: 16,
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: Image.asset(
                          AIChatAssets.backIcon,
                          width: 25,
                          height: 25,
                        ),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: Image.asset(
                          AIChatAssets.menuIcon,
                          width: 24,
                          height: 24,
                        ),
                      ),
                    ],
                  ),
                ),

                if (state is AIChatInitial ||
                    (state is AIChatMessagesLoaded && state.messages.isEmpty))
                  // Welcome Screen
                  Align(
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Mascot Image
                        Image.asset(
                          AIChatAssets.mascot,
                          width: 259,
                          height: 234,
                        ),
                        const SizedBox(height: 40),
                        // Welcome Text
                        Text(
                          AIChatStrings.welcomeTitle,
                          style: Theme.of(context).textTheme.displaySmall
                              ?.copyWith(
                                color: const Color(0xFF1F1F1F),
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        Text(
                          AIChatStrings.welcomeSubtitle,
                          style: Theme.of(context).textTheme.displaySmall
                              ?.copyWith(
                                color: const Color(0xFF1F1F1F),
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 24),
                        // Description
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 40),
                          child: Text(
                            AIChatStrings.welcomeDescription,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(
                                  color: const Color(0xFF717171),
                                  letterSpacing: 0.2,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (state is AIChatMessagesLoaded && state.messages.isNotEmpty)
                  // Chat Messages
                  Positioned(
                    top: 70,
                    left: 0,
                    right: 0,
                    bottom: 160,
                    child: ListView.builder(
                      padding: const EdgeInsets.only(bottom: 16),
                      reverse: true,
                      itemCount: state.messages.length,
                      itemBuilder: (context, index) {
                        final message =
                            state.messages[state.messages.length - 1 - index];
                        return ChatMessageWidget(message: message);
                      },
                    ),
                  ),
                if (state is AIChatError)
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: Colors.red,
                          size: 48,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          state.message,
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 16,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                if (state is! AIChatError)
                  const Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: ChatInputWidget(),
                  ),
                // Loading Indicator
                if (state is AIChatLoading)
                  Container(
                    color: Colors.black26,
                    child: const Center(child: CircularProgressIndicator()),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}
