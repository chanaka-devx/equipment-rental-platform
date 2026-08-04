import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import '../theme.dart';
import '../services/cart_service.dart';
import '../services/api_service.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _cartService = CartService();
  final _api = ApiService();
  final DateFormat formatter = DateFormat('yyyy-MM-dd');
  
  List<Map<String, dynamic>> _cartItems = [];
  bool _isLoading = true;
  bool _isCheckingOut = false;
  
  DateTime? startDate;
  DateTime? endDate;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    setState(() => _isLoading = true);
    try {
      final items = await _cartService.getCart();
      setState(() => _cartItems = items);
    } catch (e) {
      print('Error loading cart: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _removeItem(String id) async {
    await _cartService.removeFromCart(id);
    _loadCart();
  }

  Future<void> _updateQuantity(String id, int quantity) async {
    await _cartService.updateQuantity(id, quantity);
    _loadCart();
  }

  Future<void> _pickDate(bool isStart) async {
    final picked = await showDatePicker(
      context: context, 
      initialDate: isStart 
          ? (startDate ?? DateTime.now())
          : (endDate ?? startDate ?? DateTime.now()),
      firstDate: DateTime.now(), 
      lastDate: DateTime(2027),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppTheme.brandOrange,
              onPrimary: Colors.white,
              onSurface: AppTheme.onSurface,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null) {
      setState(() {
        if (isStart) {
          startDate = picked;
          if (endDate != null && endDate!.isBefore(startDate!)) {
            endDate = startDate;
          }
        } else {
          endDate = picked;
        }
      });
    }
  }

  int get _days {
    if (startDate == null || endDate == null) return 0;
    final diff = endDate!.difference(startDate!).inDays;
    return diff == 0 ? 1 : diff; 
  }

  double get _subtotal {
    return _cartItems.fold(0.0, (sum, item) {
      final priceRaw = item['rentalPrice'] ?? 0;
      final price = priceRaw is num ? priceRaw : num.tryParse(priceRaw.toString()) ?? 0;
      final qty = item['quantity'] ?? 1;
      return sum + (price.toDouble() * _days * qty);
    });
  }
  
  double get _deposit {
    return _cartItems.fold(0.0, (sum, item) {
      final depRaw = item['deposit'] ?? 0;
      final dep = depRaw is num ? depRaw : num.tryParse(depRaw.toString()) ?? 0;
      final qty = item['quantity'] ?? 1;
      return sum + (dep.toDouble() * qty);
    });
  }
  
  double get _total => _subtotal + _deposit;

  Future<void> _checkout() async {
    if (startDate == null || endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Please select both dates')));
      return;
    }
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CheckoutScreen(
          items: _cartItems,
          startDate: startDate!,
          endDate: endDate!,
        ),
      ),
    ).then((_) {
      // Reload cart in case it was cleared by checkout success
      _loadCart();
    });
  }

  Widget _buildDateField(String label, DateTime? date, VoidCallback onTap) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.onSurfaceVariant)),
        const SizedBox(height: 8),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today, size: 16, color: AppTheme.outline),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    date != null ? formatter.format(date) : 'Select date',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: date != null ? AppTheme.onSurface : AppTheme.outlineVariant,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant)),
        Text(value, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          title: const Text('Cart'),
          backgroundColor: AppTheme.surfaceContainerLowest,
          centerTitle: true,
        ),
        body: Center(child: CircularProgressIndicator(color: AppTheme.brandOrange)),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Cart'),
        backgroundColor: AppTheme.surfaceContainerLowest,
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadCart,
            tooltip: 'Refresh Cart',
          )
        ],
      ),
      body: _cartItems.isEmpty
          ? Center(
              child: Text(
                'Your cart is empty',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadCart,
              color: AppTheme.brandOrange,
              child: ListView(
                  padding: EdgeInsets.all(16),
                  children: [
                    Text('Items', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 16),
                    ..._cartItems.map((item) {
                      final String imageUrl = (item['images'] != null && item['images'].isNotEmpty) 
                          ? item['images'][0] 
                          : 'https://via.placeholder.com/150';
                      
                      return Container(
                        margin: EdgeInsets.only(bottom: 12),
                        padding: EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceContainerLowest,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                imageUrl,
                                width: 60,
                                height: 60,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  width: 60, height: 60, color: AppTheme.surfaceContainer,
                                  child: Icon(Icons.image_not_supported, color: AppTheme.outlineVariant),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['name'] ?? 'Unknown', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Text('Rs.${item['rentalPrice']} / day', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.brandOrange)),
                                      Builder(
                                        builder: (context) {
                                          final depRaw = item['deposit'];
                                          final dep = depRaw is num ? depRaw : num.tryParse(depRaw?.toString() ?? '') ?? 0;
                                          if (dep > 0) {
                                            return Padding(
                                              padding: const EdgeInsets.only(left: 8.0),
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: AppTheme.surfaceContainer,
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: Text('+Rs.${dep} dep.', style: TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant)),
                                              ),
                                            );
                                          }
                                          return const SizedBox.shrink();
                                        }
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: Icon(Icons.remove_circle_outline, color: AppTheme.brandOrange, size: 24),
                                        onPressed: () => _updateQuantity(item['equipmentId'], (item['quantity'] ?? 1) - 1),
                                        padding: EdgeInsets.zero,
                                        constraints: BoxConstraints(),
                                      ),
                                      const SizedBox(width: 12),
                                      Text('${item['quantity'] ?? 1}', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                                      const SizedBox(width: 12),
                                      IconButton(
                                        icon: Icon(Icons.add_circle_outline, color: AppTheme.brandOrange, size: 24),
                                        onPressed: () => _updateQuantity(item['equipmentId'], (item['quantity'] ?? 1) + 1),
                                        padding: EdgeInsets.zero,
                                        constraints: BoxConstraints(),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete_outline, color: Colors.red),
                              onPressed: () => _removeItem(item['equipmentId']),
                            )
                          ],
                        ),
                      );
                    }).toList(),
                    
                    const SizedBox(height: 24),
                    Text('Rental Period', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildDateField('Start Date', startDate, () => _pickDate(true))),
                        const SizedBox(width: 16),
                        Expanded(child: _buildDateField('End Date', endDate, () => _pickDate(false))),
                      ],
                    ),
                    
                    if (startDate != null && endDate != null) ...[
                      const SizedBox(height: 32),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceContainerLowest,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderSubtle),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: Offset(0, 2)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Summary', style: Theme.of(context).textTheme.titleLarge),
                            const Divider(height: 24),
                            _buildSummaryRow('Rental ($_days days)', 'Rs.${_subtotal.toStringAsFixed(2)}'),
                            const SizedBox(height: 8),
                            _buildSummaryRow('Deposit', 'Rs.${_deposit.toStringAsFixed(2)}'),
                            const Divider(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Total', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                                Text('Rs.${_total.toStringAsFixed(2)}', style: Theme.of(context).textTheme.displayMedium?.copyWith(color: AppTheme.brandNavy)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: (startDate != null && endDate != null && !_isCheckingOut) ? _checkout : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.brandOrange,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isCheckingOut 
                          ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('Checkout', style: TextStyle(fontSize: 16)),
                                const SizedBox(width: 8),
                                Icon(Icons.shopping_cart_checkout, size: 20),
                              ],
                            ),
                    ),
                    const SizedBox(height: 100),
                  ],
                ),
            ),
    );
  }
}
