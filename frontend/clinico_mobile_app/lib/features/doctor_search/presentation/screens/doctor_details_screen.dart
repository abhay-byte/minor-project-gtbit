import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_bloc.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_event.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_state.dart';

class DoctorDetailsScreen extends StatelessWidget {
  final String doctorId;

  const DoctorDetailsScreen({Key? key, required this.doctorId})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgWhite,
      body: BlocBuilder<DoctorSearchBloc, DoctorSearchState>(
        builder: (context, state) {
          if (state is DoctorDetailsLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is DoctorDetailsSuccess) {
            final doctor = state.doctor;
            return CustomScrollView(
              slivers: [
                // App Bar
                SliverAppBar(
                  expandedHeight: 200,
                  pinned: true,
                  backgroundColor: AppColors.primaryLightBlue,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Image.network(
                      doctor.imageUrl,
                      fit: BoxFit.cover,
                    ),
                  ),
                  leading: IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),

                // Doctor Info
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Name and Rating
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    doctor.name,
                                    style: AppTextStyles.heading2,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    doctor.specialization,
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      color: AppColors.textLightGrey,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.activeGreenBg,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.star_rounded,
                                    color: Colors.amber,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    doctor.rating.toString(),
                                    style: AppTextStyles.badgeText.copyWith(
                                      color: AppColors.activeGreenText,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Experience and Reviews
                        Row(
                          children: [
                            _buildInfoCard(
                              icon: Icons.work_outline_rounded,
                              title: '${doctor.experience} years',
                              subtitle: 'Experience',
                            ),
                            const SizedBox(width: 16),
                            _buildInfoCard(
                              icon: Icons.people_outline_rounded,
                              title: '${doctor.reviewCount}+',
                              subtitle: 'Reviews',
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // About
                        Text('About', style: AppTextStyles.heading2),
                        const SizedBox(height: 8),
                        Text(doctor.education, style: AppTextStyles.bodyMedium),
                        const SizedBox(height: 24),

                        // Clinic Info
                        Text('Clinic', style: AppTextStyles.heading2),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.bgLightBlue,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doctor.clinicName,
                                style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(
                                    Icons.location_on_outlined,
                                    color: AppColors.textLightGrey,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      doctor.clinicAddress,
                                      style: AppTextStyles.bodyMedium.copyWith(
                                        color: AppColors.textLightGrey,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Book Appointment Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              // TODO: Navigate to appointment booking
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryLightBlue,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              'Book Appointment',
                              style: AppTextStyles.buttonText,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          } else if (state is DoctorDetailsError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    size: 64,
                    color: AppColors.textLightGrey,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    state.message,
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textGrey,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgLightBlue,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.primaryLightBlue, size: 24),
            const SizedBox(height: 8),
            Text(
              title,
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textLightGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
