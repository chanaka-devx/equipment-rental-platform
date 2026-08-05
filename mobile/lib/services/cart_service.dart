import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class CartService {
  final _storage = const FlutterSecureStorage();
  static const _cartKey = 'user_cart_items';

  Future<List<Map<String, dynamic>>> getCart() async {
    final data = await _storage.read(key: _cartKey);
    if (data == null) return [];
    try {
      final List decoded = jsonDecode(data);
      return decoded.map((e) => e as Map<String, dynamic>).toList();
    } catch (e) {
      print('Error parsing cart: $e');
      return [];
    }
  }

  Future<void> addToCart(Map<String, dynamic> item) async {
    final cart = await getCart();
    // Check if already in cart
    final exists = cart.any((e) => e['equipmentId'] == item['equipmentId']);
    if (!exists) {
      cart.add(item);
      await _storage.write(key: _cartKey, value: jsonEncode(cart));
    }
  }

  Future<void> removeFromCart(String equipmentId) async {
    final cart = await getCart();
    cart.removeWhere((e) => e['equipmentId'] == equipmentId);
    await _storage.write(key: _cartKey, value: jsonEncode(cart));
  }

  Future<void> updateQuantity(String equipmentId, int quantity) async {
    final cart = await getCart();
    final index = cart.indexWhere((e) => e['equipmentId'] == equipmentId);
    if (index != -1) {
      if (quantity <= 0) {
        cart.removeAt(index);
      } else {
        cart[index]['quantity'] = quantity;
      }
      await _storage.write(key: _cartKey, value: jsonEncode(cart));
    }
  }

  Future<void> clearCart() async {
    await _storage.delete(key: _cartKey);
  }
}
