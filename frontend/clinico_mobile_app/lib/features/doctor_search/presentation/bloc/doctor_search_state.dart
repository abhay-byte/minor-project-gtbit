import 'package:equatable/equatable.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';

abstract class DoctorSearchState extends Equatable {
  const DoctorSearchState();

  @override
  List<Object?> get props => [];
}

class DoctorSearchInitial extends DoctorSearchState {}

class DoctorSearchLoading extends DoctorSearchState {}

class DoctorSearchSuccess extends DoctorSearchState {
  final List<Doctor> doctors;

  const DoctorSearchSuccess(this.doctors);

  @override
  List<Object> get props => [doctors];
}

class DoctorSearchError extends DoctorSearchState {
  final String message;

  const DoctorSearchError(this.message);

  @override
  List<Object> get props => [message];
}

class DoctorDetailsLoading extends DoctorSearchState {}

class DoctorDetailsSuccess extends DoctorSearchState {
  final Doctor doctor;

  const DoctorDetailsSuccess(this.doctor);

  @override
  List<Object> get props => [doctor];
}

class DoctorDetailsError extends DoctorSearchState {
  final String message;

  const DoctorDetailsError(this.message);

  @override
  List<Object> get props => [message];
}

class AvailableSlotsLoading extends DoctorSearchState {}

class AvailableSlotsSuccess extends DoctorSearchState {
  final List<String> slots;

  const AvailableSlotsSuccess(this.slots);

  @override
  List<Object> get props => [slots];
}

class AvailableSlotsError extends DoctorSearchState {
  final String message;

  const AvailableSlotsError(this.message);

  @override
  List<Object> get props => [message];
}

class BookingAppointmentLoading extends DoctorSearchState {}

class BookingAppointmentSuccess extends DoctorSearchState {}

class BookingAppointmentError extends DoctorSearchState {
  final String message;

  const BookingAppointmentError(this.message);

  @override
  List<Object> get props => [message];
}
