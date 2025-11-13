import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/prescription.dart';
import '../widgets/common_widgets.dart';
import '../widgets/prescription_card.dart';
import '../widgets/search_widgets.dart';
import '../bloc/prescription_bloc.dart';
import '../bloc/prescription_event.dart';
import '../bloc/prescription_state.dart';

class PrescriptionListScreen extends StatefulWidget {
  const PrescriptionListScreen({Key? key}) : super(key: key);

  @override
  State<PrescriptionListScreen> createState() => _PrescriptionListScreenState();
}

class _PrescriptionListScreenState extends State<PrescriptionListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'all';
  String _sortOrder = 'newest';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgLightBlue,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [_buildFilters(), _buildPrescriptionList()],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 44, 24, 24),
      color: AppColors.primaryBlue,
      child: Column(
        children: [
          Row(
            children: [
              CustomBackButton(onTap: () => Navigator.of(context).pop()),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('My Prescriptions', style: AppTextStyles.heading1),
                  const SizedBox(height: 4),
                  Text(
                    '4 prescriptions',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textLightBlue,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          PrescriptionSearchBar(
            controller: _searchController,
            onChanged: _handleSearch,
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.dividerGrey)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: FilterChips(
                  selectedFilter: _selectedFilter,
                  onFilterSelected: _handleFilterChange,
                ),
              ),
              SortDropdown(value: _sortOrder, onChanged: _handleSortChange),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPrescriptionList() {
    // TODO: Replace with actual prescription list from BLoC
    final List<Prescription> prescriptions = [
      Prescription(
        id: '1',
        doctor: Doctor(
          name: 'Dr. Lorem Ipsum',
          specialization: 'General Physician',
          location: 'Lorem Clinic',
          imageUrl: null,
        ),
        prescribedDate: DateTime(2025, 11, 9),
        followUpDate: DateTime(2025, 11, 16),
        condition: 'Fever & Throat Infection',
        medicines: List.generate(
          3,
          (index) => Medicine(
            name: 'Medicine ${index + 1}',
            duration: '5 days',
            dosage: '1 tablet',
            frequency: 'Once daily',
          ),
        ),
        status: PrescriptionStatus.active,
        hospital: 'Lorem Clinic, Delhi',
      ),
      // Add more sample prescriptions here
    ];

    return Padding(
      padding: const EdgeInsets.all(16),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: prescriptions.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final prescription = prescriptions[index];
          return PrescriptionCard(
            prescription: prescription,
            onViewDetails: () => _handleViewDetails(prescription),
            onShare: () => _handleShare(prescription),
          );
        },
      ),
    );
  }

  void _handleSearch(String value) {
    // TODO: Implement search functionality with BLoC
    print('Search query: $value');
  }

  void _handleFilterChange(String filter) {
    setState(() {
      _selectedFilter = filter;
    });
    // TODO: Implement filter functionality with BLoC
  }

  void _handleSortChange(String? value) {
    if (value != null) {
      setState(() {
        _sortOrder = value;
      });
      // TODO: Implement sort functionality with BLoC
    }
  }

  void _handleViewDetails(Prescription prescription) {
    // TODO: Implement navigation to prescription details screen
    print('View details for prescription: ${prescription.id}');
  }

  void _handleShare(Prescription prescription) {
    // TODO: Implement share functionality
    print('Share prescription: ${prescription.id}');
  }
}
