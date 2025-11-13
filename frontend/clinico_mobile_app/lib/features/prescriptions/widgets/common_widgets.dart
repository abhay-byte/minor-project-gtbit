import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

// A reusable badge widget for showing status
class StatusBadge extends StatelessWidget {
  final String text;
  final bool isActive;

  const StatusBadge({Key? key, required this.text, required this.isActive})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: isActive ? AppColors.activeGreenBg : AppColors.completedGreyBg,
        border: Border.all(
          color: isActive
              ? AppColors.activeGreenBorder
              : AppColors.completedGreyBorder,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: isActive
              ? AppColors.activeGreenText
              : AppColors.completedGreyText,
          fontFamily: 'Roboto',
        ),
      ),
    );
  }
}

// A badge widget for showing medicine count or filter type
class CustomBadge extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback? onTap;

  const CustomBadge({
    Key? key,
    required this.text,
    this.isSelected = false,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? Colors.transparent : Colors.white,
          border: Border.all(
            color: isSelected ? AppColors.primaryBlue : AppColors.borderGrey,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isSelected ? AppColors.primaryBlue : AppColors.textGrey,
            fontFamily: 'Roboto',
          ),
        ),
      ),
    );
  }
}

// Custom back button widget
class CustomBackButton extends StatelessWidget {
  final VoidCallback onTap;

  const CustomBackButton({Key? key, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(shape: BoxShape.circle),
        child: const Icon(
          Icons.arrow_back,
          color: AppColors.textWhite,
          size: 20,
        ),
      ),
    );
  }
}
