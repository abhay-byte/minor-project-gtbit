import 'package:flutter/material.dart';
import 'package:clinico_mobile_app/core/theme/app_colors.dart';
import 'package:clinico_mobile_app/core/theme/app_text_styles.dart';

class IncomingCallScreen extends StatelessWidget {
  final String doctorName;
  final String doctorImage;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const IncomingCallScreen({
    Key? key,
    required this.doctorName,
    required this.doctorImage,
    required this.onAccept,
    required this.onDecline,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgLightBlue,
      body: SafeArea(
        child: Stack(
          children: [
            // Background light effect
            Positioned(
              left: 100,
              top: -121.05,
              child: Transform.rotate(
                angle: 0.4935, // 28.278 degrees
                child: Container(
                  height: 322.588,
                  width: 313.006,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage('assets/images/call/light_effect.png'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ),

            // Main content
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 60),
                // Doctor's profile image
                Center(
                  child: Container(
                    width: 130.814,
                    height: 130.814,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: DecorationImage(
                        image: NetworkImage(doctorImage),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Doctor's name
                Text(
                  doctorName,
                  style: AppTextStyles.heading1.copyWith(
                    fontSize: 26.163,
                    letterSpacing: -0.5233,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                // Appointment message
                Text(
                  'Time for your Appointment',
                  style: AppTextStyles.bodySmall.copyWith(
                    letterSpacing: 0.2,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),

            // Call actions
            Positioned(
              bottom: 34,
              left: 33,
              right: 33,
              child: Container(
                height: 78,
                decoration: BoxDecoration(
                  color: AppColors.primaryLightBlue,
                  borderRadius: BorderRadius.circular(60),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Decline button
                    TextButton(
                      onPressed: onDecline,
                      child: Text(
                        'Decline',
                        style: AppTextStyles.buttonText.copyWith(
                          fontSize: 12,
                          letterSpacing: 0.2,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    // Accept button with white background
                    Container(
                      width: 94,
                      height: 60,
                      decoration: BoxDecoration(
                        color: AppColors.bgWhite,
                        borderRadius: BorderRadius.circular(60),
                      ),
                      child: TextButton.icon(
                        onPressed: onAccept,
                        icon: Image.asset(
                          'assets/images/call/call_accept.png',
                          width: 30,
                          height: 30,
                        ),
                        label: Text(
                          'Accept',
                          style: AppTextStyles.buttonText.copyWith(
                            fontSize: 12,
                            letterSpacing: 0.2,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textGrey,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
