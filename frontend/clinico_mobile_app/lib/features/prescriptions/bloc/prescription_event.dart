import 'package:equatable/equatable.dart';

// Events for the prescription list feature
abstract class PrescriptionEvent extends Equatable {
  const PrescriptionEvent();

  @override
  List<Object?> get props => [];
}

// Load prescriptions event
class LoadPrescriptions extends PrescriptionEvent {
  const LoadPrescriptions();
}

// Search prescriptions event
class SearchPrescriptions extends PrescriptionEvent {
  final String query;

  const SearchPrescriptions(this.query);

  @override
  List<Object?> get props => [query];
}

// Filter prescriptions event
class FilterPrescriptions extends PrescriptionEvent {
  final String filter;

  const FilterPrescriptions(this.filter);

  @override
  List<Object?> get props => [filter];
}

// Sort prescriptions event
class SortPrescriptions extends PrescriptionEvent {
  final String order;

  const SortPrescriptions(this.order);

  @override
  List<Object?> get props => [order];
}

// View prescription details event
class ViewPrescriptionDetails extends PrescriptionEvent {
  final String prescriptionId;

  const ViewPrescriptionDetails(this.prescriptionId);

  @override
  List<Object?> get props => [prescriptionId];
}

// Share prescription event
class SharePrescription extends PrescriptionEvent {
  final String prescriptionId;

  const SharePrescription(this.prescriptionId);

  @override
  List<Object?> get props => [prescriptionId];
}
