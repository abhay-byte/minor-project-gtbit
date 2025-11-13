import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/prescription.dart';
import 'common_widgets.dart';

class PrescriptionCard extends StatelessWidget {
  final Prescription prescription;
  final VoidCallback onViewDetails;
  final VoidCallback onShare;

  const PrescriptionCard({
    Key? key,
    required this.prescription,
    required this.onViewDetails,
    required this.onShare,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderGrey, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Doctor info and status
          _buildDoctorInfo(),
          const SizedBox(height: 16),

          // Hospital and date info
          _buildHospitalDateInfo(),
          const SizedBox(height: 16),

          // Condition info
          _buildConditionInfo(),
          const SizedBox(height: 16),

          // Follow-up info if available
          if (prescription.followUpDate != null) ...[
            _buildFollowUpInfo(),
            const SizedBox(height: 16),
          ],

          // Action buttons
          _buildActionButtons(),
        ],
      ),
    );
  }

  Widget _buildDoctorInfo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(prescription.doctor.name, style: AppTextStyles.heading2),
            const SizedBox(height: 4),
            Text(
              prescription.doctor.specialization,
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
        StatusBadge(
          text: prescription.isActive ? 'Active' : 'Completed',
          isActive: prescription.isActive,
        ),
      ],
    );
  }

  Widget _buildHospitalDateInfo() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.dividerGrey, width: 1),
        ),
      ),
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          // Hospital info
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                color: AppColors.textGrey,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(prescription.hospital, style: AppTextStyles.bodyMedium),
            ],
          ),
          const SizedBox(height: 8),
          // Date info
          Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                color: AppColors.textGrey,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Prescribed on: ${prescription.prescribedDateFormatted}',
                style: AppTextStyles.bodyMedium,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildConditionInfo() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgLightBlue,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primaryBlue,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.medical_information_outlined,
                  color: Colors.white,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Condition', style: AppTextStyles.bodySmall),
                    const SizedBox(height: 4),
                    Text(
                      prescription.condition,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textDark,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Container(
            margin: const EdgeInsets.only(top: 8),
            padding: const EdgeInsets.only(top: 8),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: AppColors.textLightBlue, width: 1),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Medicines Prescribed', style: AppTextStyles.bodySmall),
                CustomBadge(
                  text: '${prescription.medicineCount} medicines',
                ),,
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFollowUpInfo() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.warningBg,
        border: Border.all(color: AppColors.warningBorder),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.event_note_outlined,
            color: AppColors.warningText,
            size: 16,
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Next Follow-up',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.warningText,
                ),
              ),
              Text(
                prescription.followUpDateFormatted!,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.warningDarkText,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: onViewDetails,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryLightBlue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            icon: const Icon(
              Icons.visibility_outlined,
              size: 16,
              color: Colors.white,
            ),
            label: Text('View Details', style: AppTextStyles.buttonText),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          width: 42,
          height: 40,
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.primaryLightBlue),
            borderRadius: BorderRadius.circular(14),
          ),
          child: IconButton(
            onPressed: onShare,
            icon: const Icon(
              Icons.share_outlined,
              size: 16,
              color: AppColors.primaryLightBlue,
            ),
          ),
        ),
      ],
    );
  }
}
