import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../theme.dart';

class MyReservationsScreen extends StatefulWidget {
  const MyReservationsScreen({super.key});

  @override
  State<MyReservationsScreen> createState() => _MyReservationsScreenState();
}

class _MyReservationsScreenState extends State<MyReservationsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String _errorMsg = '';
  List<dynamic> _reservations = [];

  @override
  void initState() {
    super.initState();
    _fetchReservations();
  }

  Future<void> _fetchReservations() async {
    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });
    try {
      final res = await _apiService.get('/reservations/my-reservations');
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        setState(() {
          if (data is List) {
            _reservations = data;
          } else if (data['items'] != null) {
            _reservations = data['items'];
          } else {
            _reservations = [];
          }
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMsg = 'Failed to load reservations.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMsg = 'An error occurred while loading reservations.';
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Colors.amber.shade700;
      case 'APPROVED':
        return Colors.blue.shade700;
      case 'ACTIVE':
        return Colors.green.shade700;
      case 'COMPLETED':
        return Colors.grey.shade700;
      case 'CANCELLED':
      case 'REJECTED':
        return Colors.red.shade700;
      default:
        return Colors.grey.shade500;
    }
  }
  
  Color _getStatusBgColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Colors.amber.shade50;
      case 'APPROVED':
        return Colors.blue.shade50;
      case 'ACTIVE':
        return Colors.green.shade50;
      case 'COMPLETED':
        return Colors.grey.shade100;
      case 'CANCELLED':
      case 'REJECTED':
        return Colors.red.shade50;
      default:
        return Colors.grey.shade100;
    }
  }

  String _formatDate(String? isoString) {
    if (isoString == null) return '—';
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('MMM d, yyyy').format(date);
    } catch (_) {
      return '—';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Reservations'),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.brandNavy),
        titleTextStyle: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.brandNavy),
        actions: [
          if (!_isLoading && _errorMsg.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.brandOrange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_reservations.length}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            )
        ],
      ),
      backgroundColor: AppTheme.background,
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.brandOrange));
    }
    
    if (_errorMsg.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
            const SizedBox(height: 16),
            Text(_errorMsg, style: const TextStyle(color: Colors.redAccent)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchReservations,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.brandOrange,
                foregroundColor: Colors.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_reservations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text('No reservations yet.', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.brandNavy, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Browse equipment and make your first rental!', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.onSurfaceVariant)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchReservations,
      color: AppTheme.brandOrange,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _reservations.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final res = _reservations[index];
          final items = res['items'] as List<dynamic>? ?? [];
          final itemCount = items.length;
          
          double total = 0;
          if (res['payment'] != null && res['payment']['amount'] != null) {
            final amtRaw = res['payment']['amount'];
            total = amtRaw is num ? amtRaw.toDouble() : double.tryParse(amtRaw.toString()) ?? 0.0;
          } else {
            total = items.fold(0.0, (sum, item) {
              final priceRaw = item['unitPrice'] ?? (item['equipment'] != null ? item['equipment']['rentalPrice'] : 0) ?? 0;
              final price = priceRaw is num ? priceRaw.toDouble() : double.tryParse(priceRaw.toString()) ?? 0.0;
              final qtyRaw = item['quantity'] ?? 1;
              final qty = qtyRaw is num ? qtyRaw : num.tryParse(qtyRaw.toString()) ?? 1;
              return sum + (price * qty);
            });
          }

          final status = (res['status'] ?? 'PENDING').toString();
          final startDate = _formatDate(res['startDate']);
          final endDate = _formatDate(res['endDate']);
          
          String title = 'Reservation';
          if (items.isNotEmpty && items[0]['equipment'] != null) {
            title = items[0]['equipment']['name'] ?? 'Reservation';
          }
          
          final paymentStatus = res['payment'] != null ? res['payment']['status'] : null;

          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.borderSubtle),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppTheme.brandOrange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.receipt_long, color: AppTheme.brandOrange),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: RichText(
                              text: TextSpan(
                                text: title,
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold, color: AppTheme.brandNavy),
                                children: [
                                  if (itemCount > 1)
                                    TextSpan(
                                      text: ' +${itemCount - 1} more',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.onSurfaceVariant),
                                    ),
                                ],
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: _getStatusBgColor(status),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              status,
                              style: TextStyle(color: _getStatusColor(status), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$startDate → $endDate',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.onSurfaceVariant, fontSize: 11),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Rs.${total.toStringAsFixed(2)}',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppTheme.brandOrange, fontWeight: FontWeight.bold),
                          ),
                          if (paymentStatus != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: paymentStatus == 'PAID' ? Colors.green.shade50 : Colors.amber.shade50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                paymentStatus == 'PAID' ? '✓ Paid' : 'Pending',
                                style: TextStyle(
                                  color: paymentStatus == 'PAID' ? Colors.green.shade700 : Colors.amber.shade700,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            )
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}