// Models for the prescription list feature

// Doctor model
class Doctor {
  final String name;
  final String specialization;
  final String location;
  final String? imageUrl;

  Doctor({
    required this.name,
    required this.specialization,
    required this.location,
    this.imageUrl,
  });
}

// Medicine model
class Medicine {
  final String name;
  final String dosage;
  final String frequency;
  final String duration;

  Medicine({
    required this.name,
    required this.duration,
    required this.dosage,
    required this.frequency,
  });
}

// Prescription status enum
enum PrescriptionStatus { active, completed }

// Prescription model
class Prescription {
  final String id;
  final Doctor doctor;
  final DateTime prescribedDate;
  final DateTime? followUpDate;
  final String condition;
  final List<Medicine> medicines;
  final PrescriptionStatus status;
  final String hospital;

  Prescription({
    required this.id,
    required this.doctor,
    required this.prescribedDate,
    required this.condition,
    required this.medicines,
    required this.status,
    required this.hospital,
    this.followUpDate,
  });

  bool get isActive => status == PrescriptionStatus.active;
  int get medicineCount => medicines.length;

  // Helper method to format the prescribed date
  String get prescribedDateFormatted {
    return '${prescribedDate.day} ${_getMonth(prescribedDate.month)} ${prescribedDate.year}';
  }

  // Helper method to format the follow-up date
  String? get followUpDateFormatted {
    if (followUpDate == null) return null;
    return '${followUpDate!.day} ${_getMonth(followUpDate!.month)} ${followUpDate!.year}';
  }

  // Helper method to get month name
  String _getMonth(int month) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1];
  }
}
