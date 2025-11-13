import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import 'common_widgets.dart';

class PrescriptionSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final Function(String) onChanged;

  const PrescriptionSearchBar({
    Key? key,
    required this.controller,
    required this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        style: AppTextStyles.bodyLarge,
        decoration: InputDecoration(
          hintText: 'Search by doctor, date, or condition',
          hintStyle: AppTextStyles.searchHint,
          prefixIcon: const Icon(
            Icons.search,
            color: AppColors.textGrey,
            size: 20,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
      ),
    );
  }
}

class SortDropdown extends StatelessWidget {
  final String value;
  final Function(String?) onChanged;

  const SortDropdown({Key? key, required this.value, required this.onChanged})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.completedGreyBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderGrey),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          icon: const Icon(
            Icons.keyboard_arrow_down,
            size: 16,
            color: AppColors.textGrey,
          ),
          items: const [
            DropdownMenuItem(value: 'newest', child: Text('Newest First')),
            DropdownMenuItem(value: 'oldest', child: Text('Oldest First')),
          ],
          onChanged: onChanged,
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textDark),
          isDense: true,
        ),
      ),
    );
  }
}

class FilterChips extends StatelessWidget {
  final String selectedFilter;
  final Function(String) onFilterSelected;

  const FilterChips({
    Key? key,
    required this.selectedFilter,
    required this.onFilterSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context){
    return Row(
      children: [
        const Icon(Icons.filter_list, size: 16, color: AppColors.textGrey),
        const SizedBox(width: 8),
        Text('Filters:', style: AppTextStyles.bodyMedium),
        const SizedBox(width: 12),
        CustomBadge(
          text: 'All',
          isSelected: selectedFilter == 'all',
          onTap: () => onFilterSelected('all'),
        ),
        const SizedBox(width: 8),
        CustomBadge(
          text: 'Active',
          isSelected: selectedFilter == 'active',
          onTap: () => onFilterSelected('active'),
        ),
        const SizedBox(width: 8),
        CustomBadge(
          text: 'Completed',
          isSelected: selectedFilter == 'completed',
          onTap: () => onFilterSelected('completed'),
        ),
      ],
    );
  }
}
