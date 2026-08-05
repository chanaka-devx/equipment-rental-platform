import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:flutter_svg/flutter_svg.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'reservation_Item_screen.dart';
import 'qr_scanner_screen.dart';

class StaffReservationsScreen extends StatefulWidget {
  const StaffReservationsScreen({super.key});

  @override
  State<StaffReservationsScreen> createState() => _StaffReservationsScreenState();
}

class _StaffReservationsScreenState extends State<StaffReservationsScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  bool _isLoading = true;
  String _errorMsg = '';
  List<dynamic> _reservations = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchReservations();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchReservations() async {
    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });
    try {
      final res = await _apiService.get('/reservations');
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
      case 'PENDING': return Colors.amber.shade800;
      case 'APPROVED': return Colors.green.shade800;
      case 'ACTIVE': return Colors.blue.shade800;
      case 'COMPLETED': return Colors.grey.shade700;
      case 'CANCELLED':
      case 'REJECTED': return Colors.red.shade800;
      default: return Colors.grey.shade500;
    }
  }
  
  Color _getStatusBgColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING': return Colors.amber.shade100;
      case 'APPROVED': return Colors.green.shade100;
      case 'ACTIVE': return Colors.blue.shade100;
      case 'COMPLETED': return Colors.grey.shade200;
      case 'CANCELLED':
      case 'REJECTED': return Colors.red.shade100;
      default: return Colors.grey.shade200;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredReservations = _reservations.where((res) {
      final items = res['items'] as List<dynamic>?;
      final equipName = (items != null && items.isNotEmpty && items[0]['equipment'] != null)
          ? items[0]['equipment']['name'].toString().toLowerCase()
          : '';
      final equipId = (items != null && items.isNotEmpty && items[0]['equipment'] != null)
          ? items[0]['equipment']['id'].toString().toLowerCase()
          : '';
          
      final matchSearch = _searchQuery.isEmpty || 
          (res['id'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (res['user']?['name'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          equipId.contains(_searchQuery.toLowerCase()) ||
          equipName.contains(_searchQuery.toLowerCase());
      return matchSearch;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceContainerLowest,
        elevation: 1,
        shadowColor: Colors.black12,
        titleSpacing: 16,
        automaticallyImplyLeading: false, // Assuming it's a bottom nav tab or handled properly
        title: Row(
          children: [
            SvgPicture.asset(
              'assets/images/logo2.svg',
              height: 28,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainer,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.borderSubtle),
                ),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search...',
                    hintStyle: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.outline),
                    prefixIcon: const Icon(Icons.search, size: 18, color: AppTheme.outline),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                  ),
                  style: Theme.of(context).textTheme.bodyMedium,
                  onChanged: (value) => setState(() => _searchQuery = value),
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_none, color: AppTheme.onSurface),
            onPressed: () {
              Navigator.pushNamed(context, '/notifications');
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 90.0), // Push above the bottom nav bar
        child: FloatingActionButton(
          backgroundColor: AppTheme.brandOrange,
          child: const Icon(Icons.qr_code_scanner, color: Colors.white),
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const QRScannerScreen()),
            );
            if (result != null && result is String) {
              setState(() {
                _searchQuery = result;
                _searchController.text = result;
              });
            }
          },
        ),
      ),
      body: _buildBody(filteredReservations),
    );
  }

  Widget _buildBody(List<dynamic> filteredReservations) {
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
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.brandOrange, foregroundColor: Colors.white),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (filteredReservations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 80, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text('No reservations found.', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.brandNavy, fontWeight: FontWeight.bold)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchReservations,
      color: AppTheme.brandOrange,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: filteredReservations.length,
        separatorBuilder: (_, __) => const SizedBox(height: 5),
        itemBuilder: (context, index) {
          final res = filteredReservations[index];
          final String resId = (res['id'] ?? 'xxxx').toString();
          final String status = (res['status'] ?? 'PENDING').toString();
          final String customerName = res['user']?['name'] ?? 'Unknown User';
          
          final items = res['items'] as List<dynamic>? ?? [];
          String equipName = 'Reservation Item';
          if (items.isNotEmpty && items[0]['equipment'] != null) {
            equipName = items[0]['equipment']['name'] ?? 'Equipment';
          }
          
          return InkWell(
            onTap: () {
              Navigator.push(
                context, 
                MaterialPageRoute(builder: (_) => ReservationItemScreen(reservation: res))
              ).then((_) => _fetchReservations());
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.borderSubtle),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 4, offset: const Offset(0, 2)),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          resId,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.outline,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          customerName,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppTheme.brandNavy, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Text(
                                equipName,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.brandNavy, fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusBgColor(status),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(color: _getStatusColor(status), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.3),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.chevron_right, color: AppTheme.outline),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
