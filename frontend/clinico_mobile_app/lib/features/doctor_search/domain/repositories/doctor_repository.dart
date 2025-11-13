import 'package:dartz/dartz.dart';
import 'package:clinico_mobile_app/core/error/failures.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';

abstract class DoctorRepository {
  Future<Either<Failure, List<Doctor>>> searchDoctors({
    required String query,
    required double latitude,
    required double longitude,
    String? specialization,
    double? radius,
  });

  Future<Either<Failure, Doctor>> getDoctorDetails(String doctorId);

  Future<Either<Failure, List<String>>> getAvailableSlots({
    required String doctorId,
    required DateTime date,
  });

  Future<Either<Failure, bool>> bookAppointment({
    required String doctorId,
    required DateTime dateTime,
    required String patientId,
    String? description,
  });
}
