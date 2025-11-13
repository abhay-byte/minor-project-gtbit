import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../onboarding/language_selection_screen.dart';
import '../auth/signup_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToOnboarding();
  }

  void _navigateToOnboarding() {
    // Read persisted flag then navigate after splash delay
    () async {
      final prefs = await SharedPreferences.getInstance();
      final seenOnboarding = prefs.getBool('seenOnboarding') ?? false;

      Timer(const Duration(seconds: 3), () {
        if (!mounted) return;

        if (seenOnboarding) {
          // User already completed onboarding — go to signup/home
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const SignupScreen()),
          );
        } else {
          // First run — go to language selection -> onboarding
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => LanguageSelectionScreen()),
          );
        }
      });
    }();
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

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
        child: Stack(
          children: [
            // Dot pattern background
            ...List.generate(50, (index) {
              return Positioned(
                top: (index * 37.5) % screenHeight,
                left: (index * 47.3) % screenWidth,
                child: Container(
                  width: screenWidth * 0.01,
                  height: screenWidth * 0.01,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.3),
                    shape: BoxShape.circle,
                  ),
                ),
              );
            }),

            // Main content
            Stack(
              children: [
                // Decorative stars and shapes behind mascot
                // Top right area
                Positioned(
                  top: screenHeight * 0.46,
                  right: screenWidth * 0.08,
                  child: Icon(
                    Icons.star,
                    color: Colors.white.withValues(alpha: 0.5),
                    size: screenWidth * 0.085,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.53,
                  right: screenWidth * 0.05,
                  child: Icon(
                    Icons.close,
                    color: Colors.white.withValues(alpha: 0.4),
                    size: screenWidth * 0.075,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.565,
                  right: screenWidth * 0.21,
                  child: Icon(
                    Icons.add,
                    color: Colors.white.withValues(alpha: 0.45),
                    size: screenWidth * 0.07,
                  ),
                ),

                // Middle right area
                Positioned(
                  top: screenHeight * 0.68,
                  right: screenWidth * 0.13,
                  child: Icon(
                    Icons.add,
                    color: Colors.white.withValues(alpha: 0.5),
                    size: screenWidth * 0.08,
                  ),
                ),

                // Left side
                Positioned(
                  top: screenHeight * 0.59,
                  left: screenWidth * 0.08,
                  child: Icon(
                    Icons.circle,
                    color: Colors.white.withValues(alpha: 0.45),
                    size: screenWidth * 0.064,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.69,
                  left: screenWidth * 0.13,
                  child: Icon(
                    Icons.star,
                    color: Colors.white.withValues(alpha: 0.4),
                    size: screenWidth * 0.075,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.86,
                  left: screenWidth * 0.05,
                  child: Icon(
                    Icons.close,
                    color: Colors.white.withValues(alpha: 0.35),
                    size: screenWidth * 0.064,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.895,
                  left: screenWidth * 0.21,
                  child: Icon(
                    Icons.add,
                    color: Colors.white.withValues(alpha: 0.4),
                    size: screenWidth * 0.07,
                  ),
                ),

                // Bottom area
                Positioned(
                  top: screenHeight * 0.82,
                  left: screenWidth * 0.73,
                  child: Icon(
                    Icons.circle,
                    color: Colors.white.withValues(alpha: 0.5),
                    size: screenWidth * 0.07,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.87,
                  right: screenWidth * 0.21,
                  child: Icon(
                    Icons.circle,
                    color: Colors.white.withValues(alpha: 0.45),
                    size: screenWidth * 0.058,
                  ),
                ),
                Positioned(
                  top: screenHeight * 0.765,
                  right: screenWidth * 0.18,
                  child: Icon(
                    Icons.star,
                    color: Colors.white.withValues(alpha: 0.45),
                    size: screenWidth * 0.08,
                  ),
                ),

                // Bottom right
                Positioned(
                  bottom: screenHeight * 0.19,
                  right: screenWidth * 0.1,
                  child: Icon(
                    Icons.add,
                    color: Colors.white.withValues(alpha: 0.5),
                    size: screenWidth * 0.075,
                  ),
                ),
                Positioned(
                  bottom: screenHeight * 0.235,
                  left: screenWidth * 0.16,
                  child: Icon(
                    Icons.star,
                    color: Colors.white.withValues(alpha: 0.4),
                    size: screenWidth * 0.07,
                  ),
                ),

                // Clinico Logo
                Positioned(
                  top: screenHeight * 0.084,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Background ellipse
                        Image.asset(
                          'assets/images/Ellipse.png',
                          width: screenWidth * 0.225,
                          height: screenWidth * 0.225,
                          fit: BoxFit.cover,
                        ),

                        // Logo on top
                        Image.asset(
                          'assets/images/logo.png',
                          width: screenWidth * 0.28,
                          height: screenWidth * 0.28,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              Icons.favorite,
                              color: const Color(0xFF84B54C),
                              size: screenWidth * 0.16,
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // CLINICO text
                Positioned(
                  top: screenHeight * 0.207,
                  left: 0,
                  right: 0,
                  child: Text(
                    'CLINICO',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 29,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2,
                      color: Colors.white,
                    ),
                  ),
                ),

                // Star image behind mascot (at the top)
                Positioned(
                  top: screenHeight * 0.283,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Image.asset(
                      'assets/images/Star.png',
                      width: screenWidth * 1.2,
                      height: screenHeight * 0.53,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return const SizedBox();
                      },
                    ),
                  ),
                ),

                // Rotated bubbles image behind mascot
                Positioned(
                  top: screenHeight * 0.388,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Transform.rotate(
                      angle: 0,
                      child: Image.asset(
                        'assets/images/bubbles.png',
                        width: screenWidth * 1.013,
                        height: screenHeight * 0.447,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return const SizedBox();
                        },
                      ),
                    ),
                  ),
                ),

                // Mascot robot
                Positioned(
                  top: screenHeight * 0.251,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Image.asset(
                      'assets/images/mascot.png',
                      width: 426,
                      height: 426,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),

                // The Healing Hand Initiative text
                Positioned(
                  bottom: screenHeight * 0.212,
                  left: screenWidth * 0.1,
                  right: screenWidth * 0.1,
                  child: Text(
                    'The Healing Hand Initiative',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 24,
                      fontWeight: FontWeight.w400,
                      fontStyle: FontStyle.italic,
                      height: 1.2,
                      letterSpacing: 0,
                      color: Colors.white,
                    ),
                  ),
                ),

                // Green underline dash
                Positioned(
                  bottom: screenHeight * 0.194,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Image.asset(
                      'assets/images/green_dash.png',
                      width: screenWidth * 1.067,
                      height: screenHeight * 0.024,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),

                // Copyright text at bottom
                Positioned(
                  bottom: screenHeight * 0.047,
                  left: screenWidth * 0.1,
                  right: screenWidth * 0.1,
                  child: Text(
                    '© 2025 Clinico. All rights reserved.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 0,
                      color: Colors.white70,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
