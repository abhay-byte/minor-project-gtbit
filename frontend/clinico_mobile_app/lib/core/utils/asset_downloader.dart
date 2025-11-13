import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:flutter/foundation.dart';

class AssetDownloader {
  static final Map<String, String> _cache = {};

  static Future<String> downloadAndSaveImage(
    String url,
    String fileName,
  ) async {
    if (_cache.containsKey(url)) {
      return _cache[url]!;
    }

    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/$fileName';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);
        _cache[url] = filePath;
        return filePath;
      } else {
        throw Exception('Failed to download image');
      }
    } catch (e) {
      debugPrint('Error downloading image: $e');
      rethrow;
    }
  }

  static Future<void> downloadAllHomeAssets() async {
    final assetMap = {
      'nav_home_active.png': 'imgRectangle39907',
      'nav_chat_active.png': 'imgRectangle39908',
      'nav_alerts_active.png': 'imgRectangle39909',
      'nav_profile_active.png': 'imgRectangle39910',
      'cat_psychiatrist.png': 'imgRectangle39916',
      'cat_hepatologist.png': 'imgRectangle39917',
      'cat_cardiologist.png': 'imgRectangle39918',
      'cat_dental.png': 'imgRectangle39919',
      'cat_nephrologist.png': 'imgRectangle39920',
      'cat_pulmonologist.png': 'imgRectangle39921',
      'cat_dermatologist.png': 'imgRectangle39922',
      'cat_gastroenterologist.png': 'imgRectangle39923',
      'ai_assistant.png': 'imgRectangle39903',
      'search.png': 'imgRectangle39911',
      'filter.png': 'imgRectangle39924',
      'location.png': 'imgRectangle39914',
      'service_clinic.png': 'imgRectangle39925',
      'service_video.png': 'imgRectangle39926',
      'service_call.png': 'imgRectangle39927',
      'service_chat.png': 'imgRectangle39928',
    };

    for (final entry in assetMap.entries) {
      await downloadAndSaveImage(
        // Replace with actual Figma asset URL
        'https://www.figma.com/api/mcp/asset/${entry.value}',
        'assets/images/home/${entry.key}',
      );
    }
  }
}
