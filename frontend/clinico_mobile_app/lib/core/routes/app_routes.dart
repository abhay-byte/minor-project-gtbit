import 'package:flutter/material.dart';
import '../../screens/splash/splash_screen.dart';
import '../../screens/onboarding/language_selection_screen.dart';
import '../../screens/onboarding/onboarding_screen.dart';
import '../../screens/auth/signup_screen.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/complete_profile_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../features/ai_chat/presentation/screens/ai_chat_screen.dart';
import '../../features/doctor_search/presentation/screens/doctor_search_screen.dart';
import '../../features/doctor_search/presentation/screens/doctor_details_screen.dart';
import '../../features/doctor_search/presentation/screens/appointment_booking_screen.dart';
import '../../features/doctor_search/presentation/screens/appointment_confirmation_screen.dart';
import '../../features/doctor_search/domain/entities/doctor.dart';
import '../../features/video_call/presentation/screens/incoming_call_screen.dart';
import '../../features/video_call/presentation/screens/video_call_screen.dart';
import '../../features/phase7/presentation/screens/user_page_screen.dart';
import '../../features/phase7/presentation/screens/personal_details_screen.dart';
import '../../features/phase7/presentation/screens/medical_reminders_screen.dart';
import '../../features/phase7/presentation/screens/settings_screen.dart';
import '../../features/phase7/presentation/screens/medical_vault_screen.dart';
import '../../features/phase7/presentation/screens/document_list_screen.dart';
import '../../features/phase7/presentation/screens/document_view_screen.dart';
import '../../features/phase7/presentation/screens/notification_setting_screen.dart';
import '../../features/phase7/presentation/screens/wellness_hub_screen.dart';
import '../../features/phase7/presentation/screens/wellness_content_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String languageSelection = '/language-selection';
  static const String onboarding = '/onboarding';
  static const String signup = '/signup';
  static const String login = '/login';
  static const String completeProfile = '/complete-profile';
  static const String home = '/home';
  static const String aiChat = '/ai-chat';
  static const String doctorSearch = '/doctor-search';
  static const String doctorDetails = '/doctor-details';
  static const String appointmentBooking = '/appointment-booking';
  static const String appointmentConfirmation = '/appointment-confirmation';
  static const String incomingCall = '/incoming-call';
  static const String videoCall = '/video-call';
  static const String userPage = '/user-page';
  static const String personalDetails = '/personal-details';
  static const String medicalReminders = '/medical-reminders';
  static const String settings = '/settings';
  static const String medicalVault = '/medical-vault';
  static const String documentList = '/documents';
  static const String documentView = '/document-view';
  static const String notificationSetting = '/notification-settings';
  static const String wellnessHub = '/wellness-hub';
  static const String wellnessContent = '/wellness-content';

  static Map<String, WidgetBuilder> get routes => {
    splash: (context) => const SplashScreen(),
    languageSelection: (context) => LanguageSelectionScreen(),
    onboarding: (context) => const OnboardingScreen(),
    signup: (context) => const SignupScreen(),
    login: (context) => const LoginScreen(),
    completeProfile: (context) => const CompleteProfileScreen(),
    home: (context) => const HomeScreen(),
    aiChat: (context) => const AIChatScreen(),
    doctorSearch: (context) => const DoctorSearchScreen(),
    userPage: (context) => const UserPageScreen(),
    notificationSetting: (context) => const NotificationSettingScreen(),
    wellnessHub: (context) => const WellnessHubScreen(),
    wellnessContent: (context) => const WellnessContentScreen(),
  };

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case doctorDetails:
        final String doctorId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => DoctorDetailsScreen(doctorId: doctorId),
        );
      case appointmentBooking:
        final Doctor doctor = settings.arguments as Doctor;
        return MaterialPageRoute(
          builder: (_) => AppointmentBookingScreen(doctor: doctor),
        );
      case appointmentConfirmation:
        final Map<String, dynamic> args =
            settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => AppointmentConfirmationScreen(
            doctor: args['doctor'] as Doctor,
            appointmentDateTime: args['dateTime'] as DateTime,
          ),
        );
      case incomingCall:
        final Map<String, dynamic> args =
            settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => IncomingCallScreen(
            doctorName: args['doctorName'] as String,
            doctorImage: args['doctorImage'] as String,
            onAccept: args['onAccept'] as VoidCallback,
            onDecline: args['onDecline'] as VoidCallback,
          ),
        );
      case videoCall:
        final Map<String, dynamic> args =
            settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => VideoCallScreen(
            doctorName: args['doctorName'] as String,
            doctorImage: args['doctorImage'] as String,
            appointmentId: args['appointmentId'] as String,
          ),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
