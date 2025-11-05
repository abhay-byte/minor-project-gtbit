import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';

class OtpVerificationScreen extends StatefulWidget {
  final String email;

  const OtpVerificationScreen({
    super.key,
    required this.email,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());
  bool _isError = false;
  int _countdown = 40;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _countdown = 40;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() {
          _countdown--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  void _verifyOtp() {
    String otp = _controllers.map((c) => c.text).join();

    if (otp.length != 4) {
      return;
    }

    // Mock verification - replace with actual API call
    if (otp == "1234") {
      // Success - navigate to next screen
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP Verified Successfully!')),
      );
      // Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => NextScreen()));
    } else {
      // Show error
      setState(() {
        _isError = true;
      });
    }
  }

  void _resendOtp() {
    if (_countdown == 0) {
      setState(() {
        _isError = false;
        for (var controller in _controllers) {
          controller.clear();
        }
      });
      _startTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP Resent!')),
      );
    }
  }

  String _maskEmail(String email) {
    if (email.contains('@')) {
      List<String> parts = email.split('@');
      String username = parts[0];
      String domain = parts[1];

      if (username.length <= 3) {
        return '${username[0]}---${domain[0].toUpperCase()}${domain.substring(1)}';
      }

      return '${username.substring(0, username.length - 3)}---${domain[0].toUpperCase()}${domain.substring(1)}';
    }
    return email;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEBF1FA),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
              width: double.infinity,
              constraints: const BoxConstraints(maxWidth: 500),
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title
                  const Text(
                    'Verify Email',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 32,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1F1F1F),
                      letterSpacing: -0.5,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle
                  const Text(
                    'We Have Sent Code To Your Phone Number',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 15,
                      fontWeight: FontWeight.w400,
                      color: Color(0xFFB0B0B0),
                      height: 1.4,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Masked Email
                  Text(
                    _maskEmail(widget.email),
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 17,
                      fontWeight: FontWeight.w400,
                      color: Color(0xFFB0B0B0),
                      letterSpacing: 0.2,
                    ),
                  ),

                  const SizedBox(height: 40),

                  // OTP Input Boxes
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(4, (index) {
                        return Expanded(
                          child: Container(
                            margin: EdgeInsets.only(
                              left: index == 0 ? 0 : 6,
                              right: index == 3 ? 0 : 6,
                            ),
                            height: 64,
                            child: GestureDetector(
                              onTap: () {
                                _focusNodes[index].requestFocus();
                                // Select all text when box is tapped
                                _controllers[index].selection = TextSelection(
                                  baseOffset: 0,
                                  extentOffset: _controllers[index].text.length,
                                );
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  border: Border.all(
                                    color: _focusNodes[index].hasFocus
                                        ? const Color(0xFF3B82F6)
                                        : _isError
                                        ? const Color(0xFFEF4444)
                                        : const Color(0xFFD1D5DB),
                                    width: _focusNodes[index].hasFocus ? 2.5 : 2,
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: TextField(
                                    controller: _controllers[index],
                                    focusNode: _focusNodes[index],
                                    textAlign: TextAlign.center,
                                    keyboardType: TextInputType.number,
                                    maxLength: 1,
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 28,
                                      fontWeight: FontWeight.w400,
                                      color: _isError
                                          ? const Color(0xFFEF4444)
                                          : const Color(0xFF1F1F1F),
                                      height: 1.2,
                                    ),
                                    decoration: const InputDecoration(
                                      counterText: '',
                                      border: InputBorder.none,
                                      contentPadding: EdgeInsets.zero,
                                      isDense: true,
                                    ),
                                    inputFormatters: [
                                      FilteringTextInputFormatter.digitsOnly,
                                    ],
                                    onTap: () {
                                      // Select all text when tapped
                                      _controllers[index].selection = TextSelection(
                                        baseOffset: 0,
                                        extentOffset: _controllers[index].text.length,
                                      );
                                    },
                                    onChanged: (value) {
                                      setState(() {
                                        _isError = false;
                                      });

                                      if (value.isNotEmpty) {
                                        // Move to next field
                                        if (index < 3) {
                                          _focusNodes[index + 1].requestFocus();
                                        } else {
                                          // Last field filled, hide keyboard
                                          _focusNodes[index].unfocus();
                                        }
                                      }
                                    },
                                    onSubmitted: (value) {
                                      if (value.isEmpty && index > 0) {
                                        _focusNodes[index - 1].requestFocus();
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Error Message
                  if (_isError)
                    const Text(
                      'Invalid OTP please try again or resend.',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFFEF4444),
                      ),
                    ),

                  if (_isError) const SizedBox(height: 16),

                  // Countdown Timer
                  Text(
                    'Resend OTP in ${(_countdown ~/ 60).toString().padLeft(2, '0')}:${(_countdown % 60).toString().padLeft(2, '0')}s',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 15,
                      fontWeight: FontWeight.w400,
                      color: Color(0xFFB0B0B0),
                    ),
                  ),

                  const SizedBox(height: 40),

                  // Verify Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _verifyOtp,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF3B82F6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Verify',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 17,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Send Again Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _countdown == 0 ? _resendOtp : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEBF1FA),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                        disabledBackgroundColor: const Color(0xFFEBF1FA),
                      ),
                      child: Text(
                        'Send Again',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 17,
                          fontWeight: FontWeight.w600,
                          color: _countdown == 0
                              ? const Color(0xFF6B7280)
                              : const Color(0xFFC0C0C0),
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}