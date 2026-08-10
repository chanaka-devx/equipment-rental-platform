import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../theme.dart';

class ReservationItemScreen extends StatefulWidget {
  final Map<String, dynamic> reservation;

  const ReservationItemScreen({super.key, required this.reservation});

  @override
  State<ReservationItemScreen> createState() => _ReservationItemScreenState();
}

class _ReservationItemScreenState extends State<ReservationItemScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  late Map<String, dynamic> _reservation;

  @override
  void initState() {
    super.initState();
    _reservation = widget.reservation;
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.patch(
        '/reservations/${_reservation['id']}/status', 
        {'status': newStatus}
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        setState(() {
          _reservation = jsonDecode(res.body);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Status updated to $newStatus')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to update status')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('An error occurred')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
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

  String _formatDate(dynamic dateString) {
    if (dateString == null) return 'N/A';
    try {
      final date = DateTime.parse(dateString.toString());
      return DateFormat('MMM dd, yyyy - hh:mm a').format(date);
    } catch (e) {
      return dateString.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final String status = (_reservation['status'] ?? 'PENDING').toString().toUpperCase();
    final String resId = (_reservation['id'] ?? 'xxxx').toString();
    final String customerName = _reservation['user']?['name'] ?? 'Unknown User';
    
    final items = _reservation['items'] as List<dynamic>? ?? [];
    String equipName = 'Reservation Item';
    if (items.isNotEmpty && items[0]['equipment'] != null) {
      equipName = items[0]['equipment']['name'] ?? 'Equipment';
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.outline),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brandOrange))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.borderSubtle),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 4, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Reservation Details',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.brandNavy,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: AppTheme.borderSubtle),
                          const SizedBox(height: 16),
                          _buildDetailRow('Reservation ID', resId),
                          _buildDetailRow('Customer', customerName),
                          _buildDetailRow('Item Name', equipName),
                          _buildDetailRow('Pickup Date', _formatDate(_reservation['startDate'])),
                          _buildDetailRow('Return Date', _formatDate(_reservation['endDate'])),
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Status',
                                  style: TextStyle(color: AppTheme.outline, fontWeight: FontWeight.w500),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _getStatusBgColor(status),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    status,
                                    style: TextStyle(color: _getStatusColor(status), fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                )
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildActionButtons(status),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Container(
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppTheme.borderSubtle)),
        ),
        padding: const EdgeInsets.only(bottom: 8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(color: AppTheme.outline, fontWeight: FontWeight.w500),
            ),
            Expanded(
              child: Text(
                value,
                textAlign: TextAlign.right,
                style: const TextStyle(color: AppTheme.brandNavy, fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(String status) {
    if (status == 'PENDING') {
      return Row(
        children: [
          Expanded(
            child: _buildActionButton(
              label: 'Approve', 
              icon: Icons.check, 
              isPrimary: true, 
              onPressed: () => _updateStatus('APPROVED'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildActionButton(
              label: 'Cancel', 
              icon: Icons.close, 
              isPrimary: false, 
              onPressed: () => _updateStatus('CANCELLED'),
            ),
          ),
        ],
      );
    } else if (status == 'APPROVED') {
      return Row(
        children: [
          Expanded(
            child: _buildActionButton(
              label: 'Release', 
              icon: Icons.outbox, 
              isPrimary: true, 
              onPressed: () => _updateStatus('ACTIVE'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildActionButton(
              label: 'Cancel', 
              icon: Icons.close, 
              isPrimary: false, 
              onPressed: () => _updateStatus('CANCELLED'),
            ),
          ),
        ],
      );
    } else if (status == 'ACTIVE') {
      return Row(
        children: [
          Expanded(
            child: _buildActionButton(
              label: 'Return', 
              icon: Icons.keyboard_return, 
              isPrimary: true, 
              color: Colors.teal,
              onPressed: () => _showReturnModal(context),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildActionButton(
              label: 'Damage', 
              icon: Icons.report, 
              isPrimary: true, 
              color: Colors.red,
              onPressed: () {
                final items = _reservation['items'] as List<dynamic>? ?? [];
                if (items.isNotEmpty) {
                  final equip = items[0]['equipment'];
                  if (equip != null) {
                    _showDamageModal(context, equip['id'].toString(), equip['name'] ?? 'Equipment');
                  }
                }
              },
            ),
          ),
        ],
      );
    } else {
      return const SizedBox.shrink();
    }
  }

  void _showDamageModal(BuildContext context, String equipmentId, String equipmentName) {
    final noteController = TextEditingController();
    bool loading = false;
    
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.report, color: Colors.red),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Record Damage', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text(equipmentName, style: const TextStyle(fontSize: 12, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text('DAMAGE DESCRIPTION *', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: noteController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: 'Describe the damage observed...',
                        hintStyle: const TextStyle(fontSize: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.all(12),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text('⚠ This will mark the equipment as unavailable.', style: TextStyle(color: Colors.red, fontSize: 10)),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red, 
                            foregroundColor: Colors.white, 
                            elevation: 0,
                            minimumSize: const Size(0, 36),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: loading ? null : () async {
                            if (noteController.text.trim().isEmpty) return;
                            setState(() => loading = true);
                            try {
                              final res = await _apiService.post('/inventory/$equipmentId/damage', {'note': noteController.text.trim()});
                              if (res.statusCode == 200 || res.statusCode == 201) {
                                if (context.mounted) {
                                  Navigator.pop(context);
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Damage recorded successfully')));
                                }
                              } else {
                                throw Exception('Failed to record damage');
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                              }
                            } finally {
                              if (mounted) setState(() => loading = false);
                            }
                          },
                          child: loading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Confirm'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      }
    );
  }

  void _showReturnModal(BuildContext context) {
    final items = _reservation['items'] as List<dynamic>? ?? [];
    if (items.isEmpty) return;
    bool loading = false;
    
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.assignment_turned_in, color: Colors.teal),
                        const SizedBox(width: 8),
                        const Text('Return Items', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text('Are you sure you want to return the items in this reservation?', style: TextStyle(fontSize: 14)),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal, 
                            foregroundColor: Colors.white, 
                            elevation: 0,
                            minimumSize: const Size(0, 36),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: loading ? null : () async {
                            setState(() => loading = true);
                            final payload = items.map((item) {
                              final equipId = item['equipment']?['id'] ?? '';
                              final qtyTotal = item['quantity'] ?? 1;
                              final qtyReturned = item['returnedQuantity'] ?? 0;
                              final qtyDamaged = item['damagedQuantity'] ?? 0;
                              final maxQty = (qtyTotal is num ? qtyTotal : num.tryParse(qtyTotal.toString()) ?? 1) - 
                                             (qtyReturned is num ? qtyReturned : num.tryParse(qtyReturned.toString()) ?? 0) - 
                                             (qtyDamaged is num ? qtyDamaged : num.tryParse(qtyDamaged.toString()) ?? 0);
                              return {
                                'equipmentId': equipId,
                                'qtyGood': maxQty > 0 ? maxQty : 0,
                                'qtyDamaged': 0,
                                'note': '',
                              };
                            }).toList();
                            
                            try {
                              final res = await _apiService.post('/reservations/${_reservation['id']}/return', {'returns': payload});
                              if (res.statusCode == 200 || res.statusCode == 201) {
                                if (context.mounted) {
                                  Navigator.pop(context); // close dialog
                                  Navigator.pop(context, true); // go back to list
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Returned successfully')));
                                }
                              } else {
                                throw Exception('Failed to return');
                              }
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                              }
                            } finally {
                              if (mounted) setState(() => loading = false);
                            }
                          },
                          child: loading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Confirm'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      }
    );
  }

  Widget _buildActionButton({
    required String label, 
    required IconData icon, 
    required bool isPrimary, 
    Color? color,
    required VoidCallback onPressed
  }) {
    final effectiveColor = color ?? (isPrimary ? AppTheme.brandOrange : AppTheme.outline);
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: effectiveColor,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(
            color: isPrimary ? effectiveColor : effectiveColor.withOpacity(0.5),
            width: 2,
          ),
        ),
        elevation: 0,
      ),
      icon: Icon(icon, size: 18),
      label: Text(
        label.toUpperCase(),
        style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2),
      ),
    );
  }
}
