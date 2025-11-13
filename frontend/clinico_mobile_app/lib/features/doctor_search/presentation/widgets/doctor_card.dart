import 'package:flutter/material.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';

class DoctorCard extends StatelessWidget {
  final Doctor doctor;
  final VoidCallback onTap;

  const DoctorCard({Key? key, required this.doctor, required this.onTap})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgWhite,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Doctor Image
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: NetworkImage(doctor.imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Doctor Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(doctor.name, style: AppTextStyles.heading2),
                  const SizedBox(height: 4),
                  Text(
                    doctor.specialization,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textLightGrey,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        doctor.rating.toString(),
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${doctor.reviewCount})',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textLightGrey,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Icon(
                        Icons.access_time,
                        color: AppColors.textLightGrey,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${doctor.experience} years',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textLightGrey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Location
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            color: AppColors.textLightGrey,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '2.5 km away',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textLightGrey,
                            ),
                          ),
                        ],
                      ),
                      // Fee
                      Text(
                        '₹${doctor.consultationFee}',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primaryLightBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
