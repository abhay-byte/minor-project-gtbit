import 'dart:convert';
import 'package:dartz/dartz.dart';
import 'package:http/http.dart' as http;
import 'package:clinico_mobile_app/core/error/failures.dart';
import 'package:clinico_mobile_app/features/doctor_search/data/models/doctor_model.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/entities/doctor.dart';
import 'package:clinico_mobile_app/features/doctor_search/domain/repositories/doctor_repository.dart';

class DoctorRepositoryImpl implements DoctorRepository {
  final http.Client client;
  final String baseUrl;

  DoctorRepositoryImpl({required this.client, required this.baseUrl});

  @override
  Future<Either<Failure, List<Doctor>>> searchDoctors({
    required String query,
    required double latitude,
    required double longitude,
    String? specialization,
    double? radius,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/doctors/search').replace(
        queryParameters: {
          'query': query,
          'lat': latitude.toString(),
          'lng': longitude.toString(),
          if (specialization != null) 'specialization': specialization,
          if (radius != null) 'radius': radius.toString(),
        },
      );

      final response = await client.get(uri);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        final List<Doctor> doctors = data
            .map((json) => DoctorModel.fromJson(json))
            .toList();
        return Right(doctors);
      } else {
        return Left(ServerFailure('Failed to fetch doctors'));
      }
    } catch (e) {
      return Left(NetworkFailure('Network error: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, Doctor>> getDoctorDetails(String doctorId) async {
    try {
      final response = await client.get(
        Uri.parse('$baseUrl/doctors/$doctorId'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return Right(DoctorModel.fromJson(data));
      } else {
        return Left(ServerFailure('Failed to fetch doctor details'));
      }
    } catch (e) {
      return Left(NetworkFailure('Network error: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getAvailableSlots({
    required String doctorId,
    required DateTime date,
  }) async {
    try {
      final response = await client.get(
        Uri.parse(
          '$baseUrl/doctors/$doctorId/slots',
        ).replace(queryParameters: {'date': date.toIso8601String()}),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return Right(data.cast<String>());
      } else {
        return Left(ServerFailure('Failed to fetch available slots'));
      }
    } catch (e) {
      return Left(NetworkFailure('Network error: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, bool>> bookAppointment({
    required String doctorId,
    required DateTime dateTime,
    required String patientId,
    String? description,
  }) async {
    try {
      final response = await client.post(
        Uri.parse('$baseUrl/appointments'),
        body: json.encode({
          'doctorId': doctorId,
          'patientId': patientId,
          'dateTime': dateTime.toIso8601String(),
          if (description != null) 'description': description,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 201) {
        return const Right(true);
      } else {
        return Left(BookingFailure('Failed to book appointment'));
      }
    } catch (e) {
      return Left(NetworkFailure('Network error: ${e.toString()}'));
    }
  }
}
