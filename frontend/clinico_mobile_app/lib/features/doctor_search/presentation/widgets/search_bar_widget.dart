import 'package:flutter/material.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';

class SearchBarWidget extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onFilterTap;
  final Function(String) onSubmitted;

  const SearchBarWidget({
    Key? key,
    required this.controller,
    required this.onFilterTap,
    required this.onSubmitted,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 57,
      margin: const EdgeInsets.symmetric(horizontal: 18),
      decoration: BoxDecoration(
        color: AppColors.bgWhite,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.25),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Search Icon
          Padding(
            padding: const EdgeInsets.only(left: 20),
            child: Icon(Icons.search, color: AppColors.textGrey, size: 24),
          ),
          // Search TextField
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: TextField(
                controller: controller,
                style: AppTextStyles.bodyMedium,
                decoration: InputDecoration(
                  hintText: 'Search doctors, specialities...',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textLightGrey,
                  ),
                  border: InputBorder.none,
                ),
                onSubmitted: onSubmitted,
              ),
            ),
          ),
          // Filter Icon Button
          InkWell(
            onTap: onFilterTap,
            child: Container(
              padding: const EdgeInsets.all(8),
              margin: const EdgeInsets.only(right: 12),
              child: Icon(
                Icons.filter_list,
                color: AppColors.primaryLightBlue,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
