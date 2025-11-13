import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors
  static const Color primaryBlue = Color(0xFF4A89DC);
  static const Color secondaryBlue = Color(0xFF5B9BD5);
  static const Color accentGreen = Color(0xFF8BC34A);

  // Background Colors
  static const Color backgroundBlue = Color(0xFF4A7DC4);
  static const Color lightBlue = Color(0xFFE8F4FD);
  static const Color white = Color(0xFFFFFFFF);

  // Text Colors
  static const Color darkText = Color(0xFF333333);
  static const Color mediumText = Color(0xFF666666);
  static const Color lightText = Color(0xFF999999);
  static const Color placeholderText = Color(0xFFCCCCCC);

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFF5B9BD5),
      Color(0xFF4A7DC4),
    ],
  );

  // Dot Patterns Background
  static const Color dotPattern = Color(0x20FFFFFF);
}