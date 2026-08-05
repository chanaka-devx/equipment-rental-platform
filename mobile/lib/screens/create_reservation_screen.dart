import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/cart_service.dart';
import 'checkout_screen.dart';
import '../theme.dart';

class CreateReservationScreen extends StatefulWidget {
  final String equipmentId;
  CreateReservationScreen({required this.equipmentId});

  @override
  State<CreateReservationScreen> createState() => _CreateReservationScreenState();
}

class _CreateReservationScreenState extends State<CreateReservationScreen> {
  DateTime? startDate;
  DateTime? endDate;
  final api = ApiService();
  final _cartService = CartService();
  bool _isLoading = true;
  bool _isSubmitting = false;
  Map<String, dynamic>? equipmentData;
  final DateFormat formatter = DateFormat('yyyy-MM-dd');

  @override
  void initState() {
    super.initState();
    _loadEquipment();
  }

  void _loadEquipment() async {
    try {
      final res = await api.get('/equipment/${widget.equipmentId}');
      if (res.statusCode == 200) {
        setState(() => equipmentData = jsonDecode(res.body));
      }
    } catch (e) {
      print("Error loading equipment details: $e");
    } finally {
      setState(() => _isLoading = false);
    }
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
              primary: AppTheme.brandOrange, // header background color
              onPrimary: Colors.white, // header text color
              onSurface: AppTheme.onSurface, // body text color
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
            endDate = startDate; // Reset end date if it's before new start date
          }
        } else {
          endDate = picked;
        }
      });
    }
  }

  void _submit() {
    if (startDate == null || endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Please select both dates')));
      return;
    }
    
    if (equipmentData == null) return;
    
    final item = {
      'equipmentId': equipmentData!['id'],
      'name': equipmentData!['name'],
      'rentalPrice': equipmentData!['rentalPrice'],
      'deposit': equipmentData!['deposit'] ?? 0,
      'quantity': 1,
    };
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CheckoutScreen(
          items: [item],
          startDate: startDate!,
          endDate: endDate!,
        ),
      ),
    );
  }

  void _addToCart() async {
    if (equipmentData == null) return;
    
    setState(() => _isSubmitting = true);
    try {
      final cartItem = {
        'equipmentId': equipmentData!['id'],
        'name': equipmentData!['name'],
        'rentalPrice': equipmentData!['rentalPrice'],
        'deposit': equipmentData!['deposit'] ?? 0,
        'images': equipmentData!['images'],
      };
      await _cartService.addToCart(cartItem);
      
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Added to Cart!'),
        backgroundColor: AppTheme.statusSuccessText,
        duration: Duration(seconds: 2),
      ));
      
      Navigator.pop(context); // Go back to equipment list
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Failed to add to cart'),
        backgroundColor: Colors.red,
      ));
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  int get _days {
    if (startDate == null || endDate == null) return 0;
    final diff = endDate!.difference(startDate!).inDays;
    return diff == 0 ? 1 : diff; // Minimum 1 day
  }

  double get _subtotal {
    if (equipmentData == null || equipmentData!['rentalPrice'] == null) return 0;
    final priceRaw = equipmentData!['rentalPrice'];
    final price = priceRaw is num ? priceRaw : num.tryParse(priceRaw.toString()) ?? 0;
    return price.toDouble() * _days;
  }
  double get _deposit {
    if (equipmentData == null || equipmentData!['deposit'] == null) return 0;
    final depRaw = equipmentData!['deposit'];
    return (depRaw is num ? depRaw : num.tryParse(depRaw.toString()) ?? 0).toDouble();
  }
  
  double get _total => _subtotal + _deposit;

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        body: Center(child: CircularProgressIndicator(color: AppTheme.brandOrange)),
      );
    }

    if (equipmentData == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Error')),
        body: Center(child: Text('Equipment not found')),
      );
    }

    final imageUrl = (equipmentData!['images'] != null && equipmentData!['images'].isNotEmpty) 
        ? equipmentData!['images'][0] 
        : 'https://via.placeholder.com/150';

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
          'Reserve Equipment',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Selected Equipment Preview
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
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainer,
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: NetworkImage(imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          equipmentData!['name'] ?? 'Unknown Item',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.sell_outlined, size: 16, color: AppTheme.onSurfaceVariant),
                            const SizedBox(width: 4),
                            Text(
                              'Rs.${equipmentData!['rentalPrice'] ?? 0} / day',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Stock Status
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: ((equipmentData!['stockQuantity'] ?? 0) > 0) ? Colors.green : Colors.red,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  ((equipmentData!['stockQuantity'] ?? 0) > 0) 
                      ? '${equipmentData!['stockQuantity']} in stock — Ready to rent' 
                      : 'Currently out of stock',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: ((equipmentData!['stockQuantity'] ?? 0) > 0) ? Colors.green[700] : Colors.red[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            // Description
            Text('Description', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(
              equipmentData!['description'] ?? 'No detailed description provided for this equipment.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            
            // Specifications
            if (equipmentData!['specifications'] != null && (equipmentData!['specifications'] as Map).isNotEmpty) ...[
              Text('Specifications', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              ...((equipmentData!['specifications'] as Map).entries.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(e.key.toString(), style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.outline)),
                    Text(e.value.toString(), style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                  ],
                ),
              ))),
              const SizedBox(height: 24),
            ],
            
            // Date Selection
            Text('Dates', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildDateField('Start Date', startDate, () => _pickDate(true)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildDateField('End Date', endDate, () => _pickDate(false)),
                ),
              ],
            ),
            const SizedBox(height: 32),
            
            // Price Summary
            if (startDate != null && endDate != null) ...[
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
                    _buildSummaryRow('Rs.${equipmentData!['rentalPrice']} x $_days days', 'Rs.${_subtotal.toStringAsFixed(2)}'),
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
              const SizedBox(height: 100), // padding for bottom action
            ],
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerLowest,
          border: Border(top: BorderSide(color: AppTheme.borderSubtle)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: Offset(0, -4)),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: (_isSubmitting || ((equipmentData!['stockQuantity'] ?? 0) <= 0)) ? null : _addToCart,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppTheme.brandOrange),
                    foregroundColor: AppTheme.brandOrange,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: _isSubmitting 
                        ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: AppTheme.brandOrange, strokeWidth: 2))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add_shopping_cart, size: 20),
                              const SizedBox(width: 8),
                              Text('Add to Cart', style: TextStyle(fontSize: 16)),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: OutlinedButton(
                  onPressed: (startDate != null && endDate != null && !_isSubmitting && ((equipmentData!['stockQuantity'] ?? 0) > 0)) ? _submit : null,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: AppTheme.brandOrange),
                    foregroundColor: AppTheme.brandOrange,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: _isSubmitting 
                        ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: AppTheme.brandOrange, strokeWidth: 2))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Reserve', style: TextStyle(fontSize: 16)),
                              const SizedBox(width: 8),
                              Icon(Icons.check_circle_outline, size: 20),
                            ],
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
}