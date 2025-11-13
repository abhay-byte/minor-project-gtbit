import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/custom_button.dart';
import '../home/home_screen.dart';

class SuccessScreen extends StatelessWidget {
  const SuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final deviceWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF4B86DE), Color(0xFF003261)],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // 🎉 Confetti background
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Opacity(
                  opacity: 1,
                  child: Image.asset(
                    'assets/images/confetti.png',
                    width: double.infinity,
                    height: 508,
                    fit: BoxFit.cover,
                  ),
                ),
              ),

              // 🤖 Success Mascot
              Positioned(
                top: 44,
                left: (deviceWidth - 375) / 2,
                child: Image.asset(
                  'assets/images/sucess_moscot.png',
                  width: 375,
                  height: 442,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return const SizedBox(width: 375, height: 442);
                  },
                ),
              ),

              // 🩺 Text & Button Section
              const Positioned(
                top: 522,
                left: 0,
                right: 0,
                child: _SuccessContent(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ✅ Separated widget for main content (text + button)
class _SuccessContent extends StatelessWidget {
  const _SuccessContent();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Title with green dash directly underneath
        Column(
          children: [
            const Text(
              'Welcome to Clinico!',
              style: TextStyle(
                fontFamily: 'Roboto',
                fontWeight: FontWeight.w800,
                fontSize: 25,
                height: 1.2,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            // Green dash touching the text - no spacing
            Image.asset(
              'assets/images/green_dash.png',
              width: 200,
              height: 15,
              fit: BoxFit.contain,
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Subtitle - matches Figma (3 lines, width: 235, height: 76)
        SizedBox(
          width: 235,
          height: 76,
          child: const Text(
            "Your secure health hub is ready. Let's get started on your journey to better health.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Roboto',
              fontWeight: FontWeight.w400,
              fontSize: 14,
              height: 2.04, // 28.5px line height ÷ 14px font = 2.04
              letterSpacing: 0,
              color: Colors.white,
            ),
          ),
        ),

        const SizedBox(height: 32),

        // Button section (modularized)
        const _ExploreButton(),
      ],
    );
  }
}

// ✅ Separate widget for the button placement & style
class _ExploreButton extends StatelessWidget {
  const _ExploreButton();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 327,
      height: 48,
      child: CustomButton(
        text: 'Explore the App',
        onPressed: () {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        },
        backgroundColor: AppColors.white,
        textColor: AppColors.darkText,
        borderRadius: 10,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 24),
      ),
    );
  }
}
