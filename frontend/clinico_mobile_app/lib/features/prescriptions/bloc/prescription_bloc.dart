import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../models/prescription.dart';
import 'prescription_event.dart';
import 'prescription_state.dart';

class PrescriptionBloc extends Bloc<PrescriptionEvent, PrescriptionState> {
  PrescriptionBloc() : super(PrescriptionInitial()) {
    on<LoadPrescriptions>(_onLoadPrescriptions);
    on<SearchPrescriptions>(_onSearchPrescriptions);
    on<FilterPrescriptions>(_onFilterPrescriptions);
    on<SortPrescriptions>(_onSortPrescriptions);
    on<ViewPrescriptionDetails>(_onViewPrescriptionDetails);
    on<SharePrescription>(_onSharePrescription);
  }

  Future<void> _onLoadPrescriptions(
    LoadPrescriptions event,
    Emitter<PrescriptionState> emit,
  ) async {
    try {
      emit(PrescriptionLoading());

      // TODO: Replace with actual API call
      // Mock data for now
      final prescriptions = [
        Prescription(
          id: '1',
          doctor: Doctor(
            name: 'Dr. Lorem Ipsum',
            specialization: 'General Physician',
            location: 'Lorem Clinic',
          ),
          prescribedDate: DateTime(2025, 11, 9),
          followUpDate: DateTime(2025, 11, 16),
          condition: 'Fever & Throat Infection',
          medicines: List.generate(
            3,
            (index) => Medicine(
              name: 'Medicine ${index + 1}',
              duration: '5 days',
              dosage: '1 tablet',
              frequency: 'Once daily',
            ),
          ),
          status: PrescriptionStatus.active,
          hospital: 'Lorem Clinic, Delhi',
        ),
        Prescription(
          id: '2',
          doctor: Doctor(
            name: 'Dr. Dolor Sit Amet',
            specialization: 'Cardiologist',
            location: 'Consectetur Hospital',
          ),
          prescribedDate: DateTime(2025, 11, 5),
          followUpDate: DateTime(2025, 11, 12),
          condition: 'Hypertension Management',
          medicines: List.generate(
            2,
            (index) => Medicine(
              name: 'Medicine ${index + 1}',
              duration: '30 days',
              dosage: '1 tablet',
              frequency: 'Twice daily',
            ),
          ),
          status: PrescriptionStatus.active,
          hospital: 'Consectetur Hospital, Mumbai',
        ),
        // Add more mock prescriptions here
      ];

      emit(PrescriptionSuccess(prescriptions: prescriptions));
    } catch (e) {
      emit(PrescriptionError(e.toString()));
    }
  }

  Future<void> _onSearchPrescriptions(
    SearchPrescriptions event,
    Emitter<PrescriptionState> emit,
  ) async {
    if (state is PrescriptionSuccess) {
      final currentState = state as PrescriptionSuccess;
      final query = event.query.toLowerCase();

      final filteredPrescriptions = currentState.prescriptions.where((p) {
        return p.doctor.name.toLowerCase().contains(query) ||
            p.condition.toLowerCase().contains(query) ||
            p.hospital.toLowerCase().contains(query) ||
            p.prescribedDateFormatted.toLowerCase().contains(query);
      }).toList();

      emit(
        currentState.copyWith(
          prescriptions: filteredPrescriptions,
          searchQuery: query,
        ),
      );
    }
  }

  Future<void> _onFilterPrescriptions(
    FilterPrescriptions event,
    Emitter<PrescriptionState> emit,
  ) async {
    if (state is PrescriptionSuccess) {
      final currentState = state as PrescriptionSuccess;
      List<Prescription> filteredPrescriptions = List.from(
        currentState.prescriptions,
      );

      if (event.filter != 'all') {
        final isActive = event.filter == 'active';
        filteredPrescriptions = filteredPrescriptions
            .where((p) => p.isActive == isActive)
            .toList();
      }

      emit(
        currentState.copyWith(
          prescriptions: filteredPrescriptions,
          selectedFilter: event.filter,
        ),
      );
    }
  }

  Future<void> _onSortPrescriptions(
    SortPrescriptions event,
    Emitter<PrescriptionState> emit,
  ) async {
    if (state is PrescriptionSuccess) {
      final currentState = state as PrescriptionSuccess;
      List<Prescription> sortedPrescriptions = List.from(
        currentState.prescriptions,
      );

      sortedPrescriptions.sort((a, b) {
        if (event.order == 'newest') {
          return b.prescribedDate.compareTo(a.prescribedDate);
        } else {
          return a.prescribedDate.compareTo(b.prescribedDate);
        }
      });

      emit(
        currentState.copyWith(
          prescriptions: sortedPrescriptions,
          sortOrder: event.order,
        ),
      );
    }
  }

  Future<void> _onViewPrescriptionDetails(
    ViewPrescriptionDetails event,
    Emitter<PrescriptionState> emit,
  ) async {
    // TODO: Implement navigation to prescription details
    print('View details for prescription: ${event.prescriptionId}');
  }

  Future<void> _onSharePrescription(
    SharePrescription event,
    Emitter<PrescriptionState> emit,
  ) async {
    // TODO: Implement share functionality
    print('Share prescription: ${event.prescriptionId}');
  }
}
