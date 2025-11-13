import '../../../models/prescription.dart';

import 'package:equatable/equatable.dart';
import '../../../models/prescription.dart';

// Prescription state
abstract class PrescriptionState extends Equatable {
  @override
  List<Object?> get props => [];
}

// Initial state
class PrescriptionInitial extends PrescriptionState {}

// Loading state
class PrescriptionLoading extends PrescriptionState {}

// Error state
class PrescriptionError extends PrescriptionState {
  final String message;

  PrescriptionError(this.message);

  @override
  List<Object?> get props => [message];
}

// Success state with data
class PrescriptionSuccess extends PrescriptionState {
  final List<Prescription> prescriptions;
  final String selectedFilter;
  final String searchQuery;
  final String sortOrder;

  @override
  List<Object?> get props => [
    prescriptions,
    selectedFilter,
    searchQuery,
    sortOrder,
  ];

  PrescriptionSuccess({
    required this.prescriptions,
    this.selectedFilter = 'all',
    this.searchQuery = '',
    this.sortOrder = 'newest',
  });

  // Copy with method for updating state
  PrescriptionSuccess copyWith({
    List<Prescription>? prescriptions,
    String? selectedFilter,
    String? searchQuery,
    String? sortOrder,
  }) {
    return PrescriptionSuccess(
      prescriptions: prescriptions ?? this.prescriptions,
      selectedFilter: selectedFilter ?? this.selectedFilter,
      searchQuery: searchQuery ?? this.searchQuery,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
}
