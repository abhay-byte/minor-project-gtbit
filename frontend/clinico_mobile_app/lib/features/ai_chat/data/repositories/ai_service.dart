import 'dart:convert';
import 'package:http/http.dart' as http;

class AIService {
  static const String baseUrl =
      'https://api.clinico.ai'; // Replace with your actual API endpoint

  Future<String> generateResponse(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/chat'),
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
        },
        body: jsonEncode({
          'message': message,
          'context': 'medical', // Add any additional context needed
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] as String;
      } else {
        throw Exception('Failed to get AI response: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error communicating with AI service: $e');
    }
  }

  Future<String> generateMedicalAdvice(String symptoms) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/medical-advice'),
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
        },
        body: jsonEncode({'symptoms': symptoms}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['advice'] as String;
      } else {
        throw Exception('Failed to get medical advice: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting medical advice: $e');
    }
  }

  Future<bool> isEmergencyCase(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/emergency-check'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['isEmergency'] as bool;
      } else {
        return false; // Default to non-emergency if service fails
      }
    } catch (e) {
      return false; // Default to non-emergency in case of error
    }
  }
}
