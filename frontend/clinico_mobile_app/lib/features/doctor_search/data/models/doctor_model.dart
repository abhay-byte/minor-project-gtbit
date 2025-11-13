import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';

class DoctorModel extends Doctor {
  DoctorModel({
    required String id,
    required String name,
    required String specialization,
    required String imageUrl,
    required String experience,
    required double rating,
    required int reviewCount,
    required String clinicName,
    required String clinicAddress,
    required String education,
    required double consultationFee,
    required List<String> availableSlots,
    required Map<String, List<String>> weeklySchedule,
    required GeoLocation location,
  }) : super(
         id: id,
         name: name,
         specialization: specialization,
         imageUrl: imageUrl,
         experience: experience,
         rating: rating,
         reviewCount: reviewCount,
         clinicName: clinicName,
         clinicAddress: clinicAddress,
         education: education,
         consultationFee: consultationFee,
         availableSlots: availableSlots,
         weeklySchedule: weeklySchedule,
         location: location,
       );

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(
      id: json['id'] as String,
      name: json['name'] as String,
      specialization: json['specialization'] as String,
      imageUrl: json['imageUrl'] as String,
      experience: json['experience'] as String,
      rating: json['rating'].toDouble(),
      reviewCount: json['reviewCount'] as int,
      clinicName: json['clinicName'] as String,
      clinicAddress: json['clinicAddress'] as String,
      education: json['education'] as String,
      consultationFee: json['consultationFee'].toDouble(),
      availableSlots: List<String>.from(json['availableSlots']),
      weeklySchedule: Map<String, List<String>>.from(
        json['weeklySchedule'].map(
          (key, value) => MapEntry(key as String, List<String>.from(value)),
        ),
      ),
      location: GeoLocation(
        latitude: json['location']['latitude'].toDouble(),
        longitude: json['location']['longitude'].toDouble(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'specialization': specialization,
      'imageUrl': imageUrl,
      'experience': experience,
      'rating': rating,
      'reviewCount': reviewCount,
      'clinicName': clinicName,
      'clinicAddress': clinicAddress,
      'education': education,
      'consultationFee': consultationFee,
      'availableSlots': availableSlots,
      'weeklySchedule': weeklySchedule,
      'location': {
        'latitude': location.latitude,
        'longitude': location.longitude,
      },
    };
  }
}
