import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

class AuthService {
  final ApiService api = ApiService();
  final storage = const FlutterSecureStorage();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await api.post('/auth/login', {'email': email, 'password': password});
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw Exception('Invalid credentials');
    }
    final data = jsonDecode(res.body);
    
    // Support both camelCase and snake_case depending on API changes
    final accessToken = data['access_token'] ?? data['accessToken'];
    final refreshToken = data['refresh_token'] ?? data['refreshToken'];
    
    if (accessToken != null) {
      await storage.write(key: 'accessToken', value: accessToken);
    }
    if (refreshToken != null) {
      await storage.write(key: 'refreshToken', value: refreshToken);
    }
    
    if (data['user'] != null) {
      await storage.write(key: 'userName', value: data['user']['name']?.toString());
      await storage.write(key: 'userEmail', value: data['user']['email']?.toString());
      await storage.write(key: 'userRole', value: data['user']['role']?.toString());
    }

    return data;
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final res = await api.post('/auth/register', {'name': name, 'email': email, 'password': password});
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw Exception('Registration failed');
    }
    final data = jsonDecode(res.body);
    
    // Support both camelCase and snake_case depending on API changes
    final accessToken = data['access_token'] ?? data['accessToken'];
    final refreshToken = data['refresh_token'] ?? data['refreshToken'];
    
    if (accessToken != null) {
      await storage.write(key: 'accessToken', value: accessToken);
    }
    if (refreshToken != null) {
      await storage.write(key: 'refreshToken', value: refreshToken);
    }
    
    if (data['user'] != null) {
      await storage.write(key: 'userName', value: data['user']['name']?.toString());
      await storage.write(key: 'userEmail', value: data['user']['email']?.toString());
      await storage.write(key: 'userRole', value: data['user']['role']?.toString());
    }

    return data;
  }

  Future<void> logout() async {
    await storage.deleteAll();
  }

  Future<bool> isLoggedIn() async {
    return await storage.read(key: 'accessToken') != null;
  }

  Future<Map<String, String?>> getUserInfo() async {
    return {
      'name': await storage.read(key: 'userName'),
      'email': await storage.read(key: 'userEmail'),
      'role': await storage.read(key: 'userRole'),
    };
  }
}