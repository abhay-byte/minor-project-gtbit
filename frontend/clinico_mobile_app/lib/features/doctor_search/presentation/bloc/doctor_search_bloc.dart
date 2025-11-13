import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/repositories/doctor_repository.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_event.dart';
import 'package:clinico_mobile_app/features/doctor_search/presentation/bloc/doctor_search_state.dart';

class DoctorSearchBloc extends Bloc<DoctorSearchEvent, DoctorSearchState> {
  final DoctorRepository repository;

  DoctorSearchBloc({required this.repository}) : super(DoctorSearchInitial()) {
    on<SearchDoctorsEvent>(_onSearchDoctors);
    on<GetDoctorDetailsEvent>(_onGetDoctorDetails);
    on<GetAvailableSlotsEvent>(_onGetAvailableSlots);
    on<BookAppointmentEvent>(_onBookAppointment);
  }

  Future<void> _onSearchDoctors(
    SearchDoctorsEvent event,
    Emitter<DoctorSearchState> emit,
  ) async {
    emit(DoctorSearchLoading());
    final result = await repository.searchDoctors(
      query: event.query,
      latitude: event.latitude,
      longitude: event.longitude,
      specialization: event.specialization,
      radius: event.radius,
    );

    result.fold(
      (failure) => emit(DoctorSearchError(failure.message)),
      (doctors) => emit(DoctorSearchSuccess(doctors)),
    );
  }

  Future<void> _onGetDoctorDetails(
    GetDoctorDetailsEvent event,
    Emitter<DoctorSearchState> emit,
  ) async {
    emit(DoctorDetailsLoading());
    final result = await repository.getDoctorDetails(event.doctorId);

    result.fold(
      (failure) => emit(DoctorDetailsError(failure.message)),
      (doctor) => emit(DoctorDetailsSuccess(doctor)),
    );
  }

  Future<void> _onGetAvailableSlots(
    GetAvailableSlotsEvent event,
    Emitter<DoctorSearchState> emit,
  ) async {
    emit(AvailableSlotsLoading());
    final result = await repository.getAvailableSlots(
      doctorId: event.doctorId,
      date: event.date,
    );

    result.fold(
      (failure) => emit(AvailableSlotsError(failure.message)),
      (slots) => emit(AvailableSlotsSuccess(slots)),
    );
  }

  Future<void> _onBookAppointment(
    BookAppointmentEvent event,
    Emitter<DoctorSearchState> emit,
  ) async {
    emit(BookingAppointmentLoading());
    final result = await repository.bookAppointment(
      doctorId: event.doctorId,
      dateTime: event.dateTime,
      patientId: event.patientId,
      description: event.description,
    );

    result.fold(
      (failure) => emit(BookingAppointmentError(failure.message)),
      (_) => emit(BookingAppointmentSuccess()),
    );
  }
}
