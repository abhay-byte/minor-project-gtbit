import 'package:flutter/material.dart';
import '../widgets/cancel_appointment_dialog.dart';

class UserPageScreen extends StatelessWidget {
  const UserPageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Page (Phase 7)')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('User page placeholder'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (_) => const CancelAppointmentDialog(),
                );
              },
              child: const Text('Open Cancel Appointment Dialog'),
            ),
          ],
        ),
      ),
    );
  }
}
