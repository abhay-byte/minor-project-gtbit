import 'package:equatable/equatable.dart';

abstract class DoctorSearchEvent extends Equatable {
  const DoctorSearchEvent();

  @override
  List<Object?> get props => [];
}

class SearchDoctorsEvent extends DoctorSearchEvent {
  final String query;
  final double latitude;
  final double longitude;
  final String? specialization;
  final double? radius;

  const SearchDoctorsEvent({
    required this.query,
    required this.latitude,
    required this.longitude,
    this.specialization,
    this.radius,
  });

  @override
  List<Object?> get props => [
    query,
    latitude,
    longitude,
    specialization,
    radius,
  ];
}

class GetDoctorDetailsEvent extends DoctorSearchEvent {
  final String doctorId;

  const GetDoctorDetailsEvent(this.doctorId);

  @override
  List<Object> get props => [doctorId];
}

class GetAvailableSlotsEvent extends DoctorSearchEvent {
  final String doctorId;
  final DateTime date;

  const GetAvailableSlotsEvent({required this.doctorId, required this.date});

  @override
  List<Object> get props => [doctorId, date];
}

class BookAppointmentEvent extends DoctorSearchEvent {
  final String doctorId;
  final DateTime dateTime;
  final String patientId;
  final String? description;

  const BookAppointmentEvent({
    required this.doctorId,
    required this.dateTime,
    required this.patientId,
    this.description,
  });

  @override
  List<Object?> get props => [doctorId, dateTime, patientId, description];
}
