import 'package:flutter/material.dart';
import 'otp_verification_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final deviceHeight = MediaQuery.of(context).size.height;
    final safeBottom = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      body: Stack(
        children: [
          // Full-screen background with EBF1FA color
          Container(
            width: double.infinity,
            height: double.infinity,
            color: const Color(0xFFEBF1FA),
          ),

          // White bottom overlay
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: deviceHeight * 0.55,
              width: double.infinity,
              color: Colors.white,
            ),
          ),

          // Main content
          Positioned.fill(
            child: Stack(
              children: [
                // Logo with ellipse background at top left
                Positioned(
                  top: 89,
                  left: 32,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Background ellipse
                      Image.asset(
                        'assets/images/Ellipse.png',
                        width: 51,
                        height: 51,
                        fit: BoxFit.cover,
                      ),

                      // Logo on top
                      Image.asset(
                        'assets/images/logo.png',
                        width: 61,
                        height: 61,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(
                            Icons.favorite,
                            color: Color(0xFF84B54C),
                            size: 24,
                          );
                        },
                      ),
                    ],
                  ),
                ),

                // Mascot image
                Positioned(
                  top: 63,
                  left: 218,
                  child: Image.asset(
                    'assets/images/sad_mascot.png',
                    width: 222,
                    height: 246,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 222,
                        height: 246,
                        color: Colors.transparent,
                      );
                    },
                  ),
                ),

                // Forgot Password text
                Positioned(
                  top: 170,
                  left: 32,
                  child: SizedBox(
                    width: 327,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Forgot',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 30,
                            fontWeight: FontWeight.w700,
                            height: 1.3,
                            letterSpacing: -0.64,
                            color: const Color(0xFF1F1F1F),
                          ),
                        ),
                        Text(
                          'Password?',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 30,
                            fontWeight: FontWeight.w700,
                            height: 1.3,
                            letterSpacing: -0.64,
                            color: const Color(0xFF1F1F1F),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Subtitle text
                Positioned(
                  top: 250,
                  left: 32,
                  child: SizedBox(
                    width: 327,
                    child: Text(
                      'Enter your registered email or phone number.',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        height: 1.4,
                        letterSpacing: -0.12,
                        color: const Color(0xFF1F1F1F),
                      ),
                    ),
                  ),
                ),

                // Bottom white card area
                Positioned(
                  top: deviceHeight * 0.30,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(16),
                        topRight: Radius.circular(16),
                      ),
                    ),
                    padding: EdgeInsets.only(
                      top: 24,
                      left: 24,
                      right: 24,
                      bottom: 24 + safeBottom,
                    ),
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Email or Phone Number label + field
                            Text(
                              'Email or Phone Number',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFF475569),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              width: double.infinity,
                              height: 46,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8F9FA),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                    color: const Color(0xFFE2E8F0), width: 1),
                              ),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              child: Row(
                                children: [
                                  const Icon(Icons.person_outline,
                                      color: Color(0xFF94A3B8), size: 20),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: TextFormField(
                                      controller: _emailController,
                                      decoration: const InputDecoration(
                                        hintText: 'Enter Email or Phone Number',
                                        hintStyle: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400,
                                          color: Color(0xFFCBD5E1),
                                        ),
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.zero,
                                        isDense: true,
                                      ),
                                      style: const TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 14,
                                        fontWeight: FontWeight.w400,
                                        color: Color(0xFF1E293B),
                                      ),
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Please enter your email or phone';
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Send Reset Link button
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: ElevatedButton(
                                // In the Send Reset Link button
                                onPressed: () {
                                  if (_formKey.currentState!.validate()) {
                                    // Navigate to OTP screen
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => OtpVerificationScreen(
                                          email: _emailController.text,
                                        ),
                                      ),
                                    );
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF3B82F6),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  elevation: 0,
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: const [
                                    Text(
                                      'Send Reset Link',
                                      style: TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                    SizedBox(width: 8),
                                    Icon(
                                      Icons.arrow_forward,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Back to Log In link
                            Center(
                              child: TextButton(
                                onPressed: () => Navigator.pop(context),
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  tapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                                  minimumSize: const Size(0, 0),
                                ),
                                child: const Text(
                                  'Back to Log In',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF3B82F6),
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}