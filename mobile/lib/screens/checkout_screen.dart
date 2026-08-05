import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import '../theme.dart';
import '../services/api_service.dart';
import '../services/cart_service.dart';
import 'main_screen.dart';

class CheckoutScreen extends StatefulWidget {
  final List<Map<String, dynamic>> items;
  final DateTime startDate;
  final DateTime endDate;

  const CheckoutScreen({
    super.key,
    required this.items,
    required this.startDate,
    required this.endDate,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _api = ApiService();
  final _cartService = CartService();
  final _formKey = GlobalKey<FormState>();

  bool _isProcessing = false;
  String _step = 'form'; // 'form', 'processing', 'success', 'error'
  String _errorMsg = '';
  String _reservationId = '';

  final _cardNameController = TextEditingController();
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();

  int get _days {
    final diff = widget.endDate.difference(widget.startDate).inDays;
    return diff == 0 ? 1 : diff; // Minimum 1 day
  }

  double get _subtotal {
    return widget.items.fold(0.0, (sum, item) {
      final priceRaw = item['rentalPrice'] ?? 0;
      final price = priceRaw is num ? priceRaw : num.tryParse(priceRaw.toString()) ?? 0;
      return sum + (price.toDouble() * _days * (item['quantity'] ?? 1));
    });
  }

  double get _deposit {
    return widget.items.fold(0.0, (sum, item) {
      final depRaw = item['deposit'] ?? 0;
      final dep = depRaw is num ? depRaw : num.tryParse(depRaw.toString()) ?? 0;
      return sum + (dep.toDouble() * (item['quantity'] ?? 1));
    });
  }

  double get _total => _subtotal + _deposit;

  Future<void> _processPayment() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isProcessing = true;
      _step = 'processing';
      _errorMsg = '';
    });

    try {
      // 1. Create Reservation
      final itemsPayload = widget.items.map((e) => {
        'equipmentId': e['equipmentId'] ?? e['id'], // Handle both cart and direct reserve format
        'quantity': e['quantity'] ?? 1,
      }).toList();

      final resRes = await _api.post('/reservations', {
        'startDate': widget.startDate.toIso8601String(),
        'endDate': widget.endDate.toIso8601String(),
        'items': itemsPayload,
      });

      if (resRes.statusCode != 201 && resRes.statusCode != 200) {
        throw Exception('Failed to create reservation: ${resRes.body}');
      }
      
      final resData = jsonDecode(resRes.body);
      final resId = resData['id'] ?? resData['reservationId'] ?? (resData['data'] != null ? resData['data']['id'] : null);
      if (resId == null) throw Exception('Reservation ID not returned');
      _reservationId = resId.toString();

      // 2. Initiate Payment
      final payRes = await _api.post('/payments/$_reservationId/initiate', {});
      if (payRes.statusCode != 201 && payRes.statusCode != 200) {
        throw Exception('Failed to initiate payment: ${payRes.body}');
      }
      final payData = jsonDecode(payRes.body);
      final payId = payData['id'] ?? payData['paymentId'] ?? (payData['data'] != null ? payData['data']['id'] : null);
      if (payId == null) throw Exception('Payment ID not returned');

      // 3. Simulate Successful Payment
      final simRes = await _api.patch('/payments/$payId/simulate', {
        'outcome': 'PAID',
      });
      if (simRes.statusCode != 200 && simRes.statusCode != 201) {
        throw Exception('Failed to simulate payment: ${simRes.body}');
      }

      // 4. Clean up and Success
      await _cartService.clearCart();
      setState(() {
        _isProcessing = false;
        _step = 'success';
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
        _step = 'error';
        _errorMsg = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_step == 'processing') return _buildProcessingState();
    if (_step == 'success') return _buildSuccessState();
    
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceContainerLowest,
        elevation: 1,
        shadowColor: Colors.black12,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppTheme.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Checkout',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_step == 'error')
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_errorMsg, style: TextStyle(color: Colors.red.shade900)),
                    ),
                  ],
                ),
              ),

            // Order Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.receipt_long, color: AppTheme.brandOrange),
                      const SizedBox(width: 8),
                      Text('Order Summary', style: Theme.of(context).textTheme.titleLarge),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Rental ($_days days)', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.outline)),
                      Text('Rs.${_subtotal.toStringAsFixed(2)}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Deposit', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.outline)),
                      Text('Rs.${_deposit.toStringAsFixed(2)}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                      Text('Rs.${_total.toStringAsFixed(2)}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.brandOrange)),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),

            // Payment Details
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.credit_card, color: AppTheme.brandOrange),
                        const SizedBox(width: 8),
                        Text('Payment Details', style: Theme.of(context).textTheme.titleLarge),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _cardNameController,
                      decoration: const InputDecoration(
                        labelText: 'Name on Card',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _cardNumberController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(16),
                      ],
                      decoration: const InputDecoration(
                        labelText: 'Card Number',
                        prefixIcon: Icon(Icons.credit_card),
                      ),
                      validator: (value) => value == null || value.length < 16 ? 'Invalid Card Number' : null,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _expiryController,
                            keyboardType: TextInputType.datetime,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(4),
                            ],
                            decoration: const InputDecoration(
                              labelText: 'Expiry (MMYY)',
                              prefixIcon: Icon(Icons.calendar_today),
                            ),
                            validator: (value) => value == null || value.length < 4 ? 'Invalid' : null,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            controller: _cvvController,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(4),
                            ],
                            decoration: const InputDecoration(
                              labelText: 'CVV',
                              prefixIcon: Icon(Icons.security),
                            ),
                            obscureText: true,
                            validator: (value) => value == null || value.length < 3 ? 'Invalid' : null,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
        ),
        child: SafeArea(
          child: ElevatedButton(
            onPressed: _isProcessing ? null : _processPayment,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.brandOrange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: Text('Pay Rs.${_total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
    );
  }

  Widget _buildProcessingState() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppTheme.brandOrange),
            const SizedBox(height: 24),
            Text(
              'Processing Payment...',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Please do not close the app.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.outline),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessState() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_circle, size: 48, color: Colors.green.shade600),
              ),
              const SizedBox(height: 24),
              Text(
                'Payment Successful!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Your reservation is confirmed.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.outline),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate to MainScreen and show Reservations tab
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (context) => const MainScreen(initialIndex: 2)),
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.brandOrange,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('View My Reservations', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (context) => const MainScreen(initialIndex: 0)),
                      (route) => false,
                    );
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: AppTheme.onSurfaceVariant,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Back to Home'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
