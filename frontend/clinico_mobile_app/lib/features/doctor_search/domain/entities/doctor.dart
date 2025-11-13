class Doctor {
  final String id;
  final String name;
  final String specialization;
  final String imageUrl;
  final String experience;
  final double rating;
  final int reviewCount;
  final String clinicName;
  final String clinicAddress;
  final String education;
  final double consultationFee;
  final List<String> availableSlots;
  final Map<String, List<String>> weeklySchedule;
  final GeoLocation location;

  Doctor({
    required this.id,
    required this.name,
    required this.specialization,
    required this.imageUrl,
    required this.experience,
    required this.rating,
    required this.reviewCount,
    required this.clinicName,
    required this.clinicAddress,
    required this.education,
    required this.consultationFee,
    required this.availableSlots,
    required this.weeklySchedule,
    required this.location,
  });
}

class GeoLocation {
  final double latitude;
  final double longitude;

  GeoLocation({required this.latitude, required this.longitude});
}
