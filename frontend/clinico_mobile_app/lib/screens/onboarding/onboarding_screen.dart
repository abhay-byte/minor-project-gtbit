import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../auth/signup_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Chat with Elphie our AI Care\nCompanion',
      description:
      'Get instant, intelligent health advice anytime, and anywhere.',
      imagePath: 'assets/images/onboarding1.png',
      upperHeight: 442,
      dashWordIndex: 1, // Under "AI Care" in first line
    ),
    OnboardingPage(
      title: 'Find a Doctor Near You',
      description:
      'Hyperlocal search helps you connect with trusted specialists and clinics in your community.',
      imagePath: 'assets/images/onboarding2.png',
      upperHeight: 442,
      dashWordIndex: 1, // Under "a Doctor"
    ),
    OnboardingPage(
      title: 'Video Consultations',
      description:
      'Connect with doctors virtually, anytime, and anywhere. Your health, on your schedule.',
      imagePath: 'assets/images/onboarding3.png',
      upperHeight: 442,
      dashWordIndex: 1, // Under "Consultations"
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final statusBarHeight = MediaQuery.of(context).padding.top;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppColors.primaryGradient,
        ),
        child: Stack(
          children: [
            // Upper section with image and network pattern
            Positioned(
              top: statusBarHeight,
              left: 0,
              right: 0,
              child: SizedBox(
                width: 375,
                height: _pages[_currentPage].upperHeight.toDouble(),
                child: Stack(
                  children: [
                    // Network pattern background
                    Positioned.fill(
                      child: CustomPaint(
                        painter: NetworkPatternPainter(),
                      ),
                    ),
                    // Main illustration - PageView
                    PageView.builder(
                      controller: _pageController,
                      onPageChanged: (index) {
                        setState(() {
                          _currentPage = index;
                        });
                      },
                      itemCount: _pages.length,
                      itemBuilder: (context, index) {
                        return Center(
                          child: Image.asset(
                            _pages[index].imagePath,
                            width: 375,
                            height: _pages[index].upperHeight.toDouble(),
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                width: 375,
                                height: _pages[index].upperHeight.toDouble(),
                                color: Colors.white.withValues(alpha: 0.1),
                                child: const Icon(
                                  Icons.image,
                                  size: 100,
                                  color: Colors.white,
                                ),
                              );
                            },
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Bottom section with content
            Positioned(
              top: statusBarHeight + _pages[_currentPage].upperHeight.toDouble(),
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                width: 375,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Column(
                  children: [
                    const SizedBox(height: 32),

                    // Title section with green dash
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        children: [
                          // Title text with green dash positioned correctly
                          _buildTitleWithDash(_pages[_currentPage]),
                          const SizedBox(height: 20),
                          // Description text
                          Text(
                            _pages[_currentPage].description,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontFamily: 'Roboto',
                              fontSize: 16,
                              fontWeight: FontWeight.w400,
                              height: 1.5,
                              letterSpacing: 0,
                              color: Color(0xFF718096),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Page indicator - Fixed aspect ratio
                    SizedBox(
                      height: 32,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _pages.length,
                              (index) {
                            final isActive = index == _currentPage;
                            final isPast = index < _currentPage;

                            return Row(
                              children: [
                                // Circle indicator
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  width: isActive ? 32 : 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: isPast
                                        ? const Color(0xFF84B54C)
                                        : isActive
                                        ? const Color(0xFF3694ED)
                                        : const Color(0xFFE2E8F0),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: isPast
                                        ? const Icon(
                                      Icons.check,
                                      color: Colors.white,
                                      size: 18,
                                    )
                                        : Text(
                                      '${index + 1}',
                                      style: TextStyle(
                                        fontFamily: 'Roboto',
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: isActive
                                            ? Colors.white
                                            : const Color(0xFF718096),
                                      ),
                                    ),
                                  ),
                                ),
                                // Connecting line
                                if (index < _pages.length - 1)
                                  Container(
                                    width: 48,
                                    height: 2,
                                    margin: const EdgeInsets.symmetric(horizontal: 4),
                                    color: isPast
                                        ? const Color(0xFF84B54C)
                                        : const Color(0xFFE2E8F0),
                                  ),
                              ],
                            );
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Next/Get Started button
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Container(
                        width: double.infinity,
                        height: 56,
                        decoration: BoxDecoration(
                          color: const Color(0xFF3694ED),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF3694ED).withValues(alpha: 0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(12),
                            onTap: () {
                              if (_currentPage == _pages.length - 1) {
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const SignupScreen(),
                                  ),
                                );
                              } else {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              }
                            },
                            child: Center(
                              child: Text(
                                _currentPage == _pages.length - 1
                                    ? 'Get Started'
                                    : 'Next',
                                style: const TextStyle(
                                  fontFamily: 'Roboto',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                  letterSpacing: 0,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitleWithDash(OnboardingPage page) {
    if (_currentPage == 0) {
      // Page 1: "Chat with our AI Care\nCompanion"
      // Dash under "AI Care"
      return Column(
        children: [
          RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(
                fontFamily: 'Roboto',
                fontSize: 32,
                fontWeight: FontWeight.w800,
                height: 1.2,
                letterSpacing: 0,
                color: Color(0xFF2D3748),
              ),
              children: [
                TextSpan(text: 'Chat with our '),
                TextSpan(
                  text: 'AI Care',
                  style: TextStyle(
                    color: Color(0xFF2D3748),
                  ),
                ),
                TextSpan(text: '\nCompanion'),
              ],
            ),
          ),
          const SizedBox(height: 2),
          Padding(
            padding: const EdgeInsets.only(right: 105),
            child: Image.asset(
              'assets/images/green_dash.png',
              width: 400,
              height: 20,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: 120,
                  height: 12,
                  decoration: BoxDecoration(
                    color: const Color(0xFF84B54C),
                    borderRadius: BorderRadius.circular(6),
                  ),
                );
              },
            ),
          ),
        ],
      );
    } else if (_currentPage == 1) {
      // Page 2: "Find a Doctor Near You"
      // Dash under "a Doctor"
      return Column(
        children: [
          RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(
                fontFamily: 'Roboto',
                fontSize: 32,
                fontWeight: FontWeight.w800,
                height: 1.2,
                letterSpacing: 0,
                color: Color(0xFF2D3748),
              ),
              children: [
                TextSpan(text: 'Find '),
                TextSpan(
                  text: 'a Doctor',
                  style: TextStyle(
                    color: Color(0xFF2D3748),
                  ),
                ),
                TextSpan(text: ' Near You'),
              ],
            ),
          ),
          const SizedBox(height: 2),
          Padding(
            padding: const EdgeInsets.only(left: 0),
            child: Image.asset(
              'assets/images/green_dash.png',
              width: 400,
              height: 20,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: 150,
                  height: 12,
                  decoration: BoxDecoration(
                    color: const Color(0xFF84B54C),
                    borderRadius: BorderRadius.circular(6),
                  ),
                );
              },
            ),
          ),
        ],
      );
    } else {
      // Page 3: "Video Consultations"
      // Dash under "Consultations"
      return Column(
        children: [
          RichText(
            textAlign: TextAlign.center,
            text: const TextSpan(
              style: TextStyle(
                fontFamily: 'Roboto',
                fontSize: 32,
                fontWeight: FontWeight.w800,
                height: 1.2,
                letterSpacing: 0,
                color: Color(0xFF2D3748),
              ),
              children: [
                TextSpan(text: 'Video '),
                TextSpan(
                  text: 'Consultations',
                  style: TextStyle(
                    color: Color(0xFF2D3748),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 2),
          Padding(
            padding: const EdgeInsets.only(left: 0),
            child: Image.asset(
              'assets/images/green_dash.png',
              width: 400,
              height: 20,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  width: 220,
                  height: 12,
                  decoration: BoxDecoration(
                    color: const Color(0xFF84B54C),
                    borderRadius: BorderRadius.circular(6),
                  ),
                );
              },
            ),
          ),
        ],
      );
    }
  }
}

// Custom painter for network pattern background
class NetworkPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.15)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final nodePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.3)
      ..style = PaintingStyle.fill;

    // Define network nodes positions
    final List<Offset> nodes = [
      Offset(size.width * 0.1, size.height * 0.15),
      Offset(size.width * 0.3, size.height * 0.05),
      Offset(size.width * 0.5, size.height * 0.2),
      Offset(size.width * 0.7, size.height * 0.1),
      Offset(size.width * 0.9, size.height * 0.25),
      Offset(size.width * 0.15, size.height * 0.4),
      Offset(size.width * 0.4, size.height * 0.35),
      Offset(size.width * 0.65, size.height * 0.45),
      Offset(size.width * 0.85, size.height * 0.5),
      Offset(size.width * 0.2, size.height * 0.65),
      Offset(size.width * 0.5, size.height * 0.7),
      Offset(size.width * 0.8, size.height * 0.75),
      Offset(size.width * 0.1, size.height * 0.85),
      Offset(size.width * 0.35, size.height * 0.9),
      Offset(size.width * 0.6, size.height * 0.88),
      Offset(size.width * 0.9, size.height * 0.95),
    ];

    // Draw connections between nearby nodes
    for (int i = 0; i < nodes.length; i++) {
      for (int j = i + 1; j < nodes.length; j++) {
        final distance = (nodes[i] - nodes[j]).distance;
        if (distance < size.width * 0.4) {
          canvas.drawLine(nodes[i], nodes[j], paint);
        }
      }
    }

    // Draw nodes
    for (final node in nodes) {
      canvas.drawCircle(node, 3, nodePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class OnboardingPage {
  final String title;
  final String description;
  final String imagePath;
  final int upperHeight;
  final int dashWordIndex;

  OnboardingPage({
    required this.title,
    required this.description,
    required this.imagePath,
    required this.upperHeight,
    required this.dashWordIndex,
  });
}