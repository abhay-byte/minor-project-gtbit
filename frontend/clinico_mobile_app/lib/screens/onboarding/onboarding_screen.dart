import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth/signup_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      image: 'assets/images/onboarding1.png',
      title: 'Chat with Elphie our AI Care Companion',
      description:
          'Get instant, intelligent health advice anytime, and\nanywhere.',
      dashImage: 'assets/images/green_dash.png',
      dashPaddingLeft: 0,
      dashPaddingRight: 165,
    ),
    OnboardingData(
      image: 'assets/images/onboarding2.png',
      title: 'Find a Doctor Near You',
      description:
          'Hyperlocal search helps you connect with trusted\nspecialists and clinics in your community.',
      dashImage: 'assets/images/green_dash.png',
      dashPaddingLeft: 65,
      dashPaddingRight: 65,
    ),
    OnboardingData(
      image: 'assets/images/onboarding3.png',
      title: 'Video Consultations',
      description:
          'Connect with doctors virtually, anytime, and\nanywhere. Your health, on your schedule.',
      dashImage: 'assets/images/green_dash.png',
      dashPaddingLeft: 85,
      dashPaddingRight: 0,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEBF1FA),
      body: SafeArea(
        child: Column(
          children: [
            // Top section with background image and character image
            SizedBox(
              height: 480,
              child: Stack(
                children: [
                  // Background network pattern dots
                  Positioned.fill(
                    child: CustomPaint(painter: NetworkPatternPainter()),
                  ),

                  // Background image container with shadow - 327x396
                  Positioned(
                    left: 24,
                    top: 60,
                    child: Container(
                      width: 327,
                      height: 396,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(73),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.25),
                            blurRadius: 30,
                            offset: const Offset(0, 4),
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(73),
                        child: Image.asset(
                          'assets/images/bg.png',
                          width: 327,
                          height: 396,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),

                  // PageView with character images centered - 218px width from measurements
                  Positioned(
                    left: 0,
                    top:
                        82.5, // Adjusted to center vertically within bg container
                    right: 0,
                    child: SizedBox(
                      height: 350,
                      child: PageView.builder(
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
                              _pages[index].image,
                              width:
                                  257, // Matching the design width (from 101.5 to 210 ≈ 257 at center)
                              height: 350,
                              fit: BoxFit.contain,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: SizedBox(
                width: 350,
                child: Text(
                  _pages[_currentPage].title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF404040),
                    fontSize: 28,
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 6),

            // Green dash image
            Padding(
              padding: EdgeInsets.only(
                left: _pages[_currentPage].dashPaddingLeft,
                right: _pages[_currentPage].dashPaddingRight,
              ),
              child: Image.asset(
                _pages[_currentPage].dashImage,
                width: 200,
                height: 20,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 140,
                    height: 12,
                    decoration: BoxDecoration(
                      color: const Color(0xFF84B54C),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 28),

            // Description
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: SizedBox(
                width: 340,
                child: Text(
                  _pages[_currentPage].description,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF404040),
                    fontSize: 14,
                    fontFamily: 'Roboto',
                    fontWeight: FontWeight.w400,
                    height: 1.5,
                  ),
                ),
              ),
            ),

            const Spacer(),

            // Page Indicator
            SizedBox(
              height: 32,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildStepIndicator(0),
                  Container(
                    width: 36,
                    height: 1,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    color: _currentPage > 0
                        ? const Color(0xFF84B54C)
                        : const Color(0xFF47B1FF),
                  ),
                  _buildStepIndicator(1),
                  Container(
                    width: 36,
                    height: 1,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    color: _currentPage > 1
                        ? const Color(0xFF84B54C)
                        : const Color(0xFF47B1FF),
                  ),
                  _buildStepIndicator(2),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Next/Get Started Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GestureDetector(
                onTap: () async {
                  if (_currentPage < _pages.length - 1) {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  } else {
                    // Mark onboarding as completed and navigate to signup
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.setBool('seenOnboarding', true);

                    if (!mounted) return;

                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SignupScreen(),
                      ),
                    );
                  }
                },
                child: Container(
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3694ED),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFCFE5FF),
                        blurRadius: 0,
                        offset: const Offset(0, 0),
                        spreadRadius: 1,
                      ),
                      const BoxShadow(
                        color: Color(0x7A253EA7),
                        blurRadius: 2,
                        offset: Offset(0, 1),
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      _currentPage == _pages.length - 1
                          ? 'Get Started'
                          : 'Next',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator(int step) {
    bool isCompleted = _currentPage > step;
    bool isCurrent = _currentPage == step;

    return Container(
      width: 26,
      height: 26,
      padding: const EdgeInsets.all(6.5),
      decoration: BoxDecoration(
        color: isCompleted
            ? const Color(0xFF5DB4E0)
            : isCurrent
            ? const Color(0xFF5DB4E0)
            : const Color(0xFFD6F1FF),
        shape: BoxShape.circle,
        border: Border.all(width: 0.5, color: const Color(0xFF47B1FF)),
      ),
      child: Center(
        child: isCompleted
            ? const Icon(Icons.check, size: 12, color: Colors.white)
            : Text(
                '${step + 1}',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: isCurrent ? Colors.white : const Color(0xFF404040),
                  fontSize: 9,
                  fontFamily: 'Inter',
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }
}

// Custom painter for network pattern background
class NetworkPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.15)
      ..strokeWidth = 1
      ..style = PaintingStyle.fill;

    // Create random dots pattern
    final random = [
      Offset(size.width * 0.1, 80),
      Offset(size.width * 0.3, 50),
      Offset(size.width * 0.5, 120),
      Offset(size.width * 0.7, 40),
      Offset(size.width * 0.9, 100),
      Offset(size.width * 0.15, 200),
      Offset(size.width * 0.4, 180),
      Offset(size.width * 0.65, 220),
      Offset(size.width * 0.85, 250),
      Offset(size.width * 0.2, 320),
      Offset(size.width * 0.5, 350),
      Offset(size.width * 0.8, 380),
    ];

    for (final point in random) {
      canvas.drawCircle(point, 1.5, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class OnboardingData {
  final String image;
  final String title;
  final String description;
  final String dashImage;
  final double dashPaddingLeft;
  final double dashPaddingRight;

  OnboardingData({
    required this.image,
    required this.title,
    required this.description,
    required this.dashImage,
    required this.dashPaddingLeft,
    required this.dashPaddingRight,
  });
}
