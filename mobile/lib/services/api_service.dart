import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import '../config/api_config.dart';

class ApiService {
  final storage = const FlutterSecureStorage();

  Future<Map<String, String>> _headers() async {
    final token = await storage.read(key: 'accessToken');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await storage.read(key: 'refreshToken');
    if (refreshToken == null) return false;
    
    try {
      final res = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );
      
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        final newAccess = data['access_token'] ?? data['accessToken'];
        final newRefresh = data['refresh_token'] ?? data['refreshToken'];
        if (newAccess != null) {
          await storage.write(key: 'accessToken', value: newAccess);
        }
        if (newRefresh != null) {
          await storage.write(key: 'refreshToken', value: newRefresh);
        }
        return true;
      }
    } catch (e) {
      // Ignore network errors during refresh
    }
    return false;
  }

  Future<http.Response> get(String path) async {
    var res = await http.get(Uri.parse('${ApiConfig.baseUrl}$path'), headers: await _headers());
    if (res.statusCode == 401 && !path.contains('/auth/')) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        res = await http.get(Uri.parse('${ApiConfig.baseUrl}$path'), headers: await _headers());
      }
    }
    return res;
  }

  Future<http.Response> post(String path, Map<String, dynamic> body) async {
    var res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    if (res.statusCode == 401 && !path.contains('/auth/')) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        res = await http.post(
          Uri.parse('${ApiConfig.baseUrl}$path'),
          headers: await _headers(),
          body: jsonEncode(body),
        );
      }
    }
    return res;
  }

  Future<http.Response> patch(String path, Map<String, dynamic> body) async {
    var res = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    if (res.statusCode == 401 && !path.contains('/auth/')) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        res = await http.patch(
          Uri.parse('${ApiConfig.baseUrl}$path'),
          headers: await _headers(),
          body: jsonEncode(body),
        );
      }
    }
    return res;
  }
}