import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTextStyles {
  // Headings
  static const heading1 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w400,
    color: AppColors.textWhite,
    fontFamily: 'Roboto',
  );

  static const heading2 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w400,
    color: AppColors.textDark,
    fontFamily: 'Roboto',
  );

  // Body text
  static const bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textGrey,
    fontFamily: 'Roboto',
  );

  static const bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textGrey,
    fontFamily: 'Roboto',
  );

  static const bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.textLightGrey,
    fontFamily: 'Roboto',
  );

  // Button text
  static const buttonText = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textWhite,
    fontFamily: 'Roboto',
  );

  // Badge text
  static const badgeText = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.activeGreenText,
    fontFamily: 'Roboto',
  );

  // Search hint text
  static const searchHint = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.textLightGrey,
    fontFamily: 'Roboto',
  );
}
