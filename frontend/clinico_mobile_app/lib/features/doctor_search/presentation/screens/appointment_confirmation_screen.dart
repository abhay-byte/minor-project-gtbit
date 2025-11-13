import 'package:flutter/material.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';

class AppointmentConfirmationScreen extends StatelessWidget {
  final Doctor doctor;
  final DateTime appointmentDateTime;

  const AppointmentConfirmationScreen({
    Key? key,
    required this.doctor,
    required this.appointmentDateTime,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgWhite,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Success Icon
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.activeGreenBg,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.check_rounded,
                          size: 64,
                          color: AppColors.activeGreenText,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Success Message
                      Text(
                        'Appointment Confirmed!',
                        style: AppTextStyles.heading2.copyWith(
                          color: AppColors.activeGreenText,
                          fontSize: 24,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Your appointment has been successfully scheduled',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textGrey,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Appointment Details
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.bgLightBlue,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            // Doctor Info
                            Row(
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    image: DecorationImage(
                                      image: NetworkImage(doctor.imageUrl),
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        doctor.name,
                                        style: AppTextStyles.heading2,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        doctor.specialization,
                                        style: AppTextStyles.bodyMedium
                                            .copyWith(
                                              color: AppColors.textLightGrey,
                                            ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 32),
                            // Date & Time
                            _buildDetailRow(
                              icon: Icons.calendar_today_rounded,
                              title: 'Date',
                              value: _formatDate(appointmentDateTime),
                            ),
                            const SizedBox(height: 16),
                            _buildDetailRow(
                              icon: Icons.access_time_rounded,
                              title: 'Time',
                              value: _formatTime(appointmentDateTime),
                            ),
                            const SizedBox(height: 16),
                            _buildDetailRow(
                              icon: Icons.location_on_outlined,
                              title: 'Location',
                              value: doctor.clinicName,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom Buttons
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        // TODO: Navigate to appointments list
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppColors.primaryLightBlue),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'View Appointments',
                        style: AppTextStyles.buttonText.copyWith(
                          color: AppColors.primaryLightBlue,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(
                          context,
                        ).popUntil((route) => route.isFirst);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryLightBlue,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text('Done', style: AppTextStyles.buttonText),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, color: AppColors.textLightGrey, size: 20),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textLightGrey,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _formatDate(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
  }

  String _formatTime(DateTime dateTime) {
    final hour = dateTime.hour.toString().padLeft(2, '0');
    final minute = dateTime.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
