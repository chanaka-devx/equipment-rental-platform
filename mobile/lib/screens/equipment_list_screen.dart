import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:flutter_svg/flutter_svg.dart';
import '../services/api_service.dart';
import 'create_reservation_screen.dart';
import '../theme.dart';
import 'notifications_screen.dart';

class EquipmentListScreen extends StatefulWidget {
  @override
  State<EquipmentListScreen> createState() => _EquipmentListScreenState();
}

class _EquipmentListScreenState extends State<EquipmentListScreen> {
  final api = ApiService();
  List equipment = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  String _searchQuery = '';

  List<String> _categories = ['All']; // Will be populated from API

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _loadEquipment();
  }

  void _loadCategories() async {
    try {
      final res = await api.get('/categories');
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        final List items = data is List ? data : (data['items'] ?? []);
        final fetchedCategories = items.map<String>((c) => c['name']?.toString() ?? 'Unknown').toList();
        
        if (mounted) {
          setState(() {
            _categories = ['All', ...fetchedCategories];
          });
        }
      }
    } catch (e) {
      print("Failed to load categories: $e");
    }
  }

  void _loadEquipment() async {
    try {
      final res = await api.get('/equipment');
      final data = jsonDecode(res.body);
      setState(() => equipment = data['items'] ?? data);
    } catch (e) {
      print("Failed to load equipment: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceContainerLowest,
        elevation: 1,
        shadowColor: Colors.black12,
        titleSpacing: 16,
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
                  decoration: InputDecoration(
                    hintText: 'Search...',
                    hintStyle: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.outline),
                    prefixIcon: Icon(Icons.search, size: 18, color: AppTheme.outline),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                  ),
                  style: Theme.of(context).textTheme.bodyMedium,
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
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
      body: _isLoading 
        ? Center(child: CircularProgressIndicator(color: AppTheme.brandOrange))
        : Builder(
            builder: (context) {
              final _filteredEquipment = equipment.where((e) {
                final catName = e['category']?['name'];
                final matchCat = _selectedCategory == 'All' || catName == _selectedCategory;
                
                final name = (e['name'] ?? '').toString().toLowerCase();
                final desc = (e['description'] ?? '').toString().toLowerCase();
                final matchSearch = _searchQuery.isEmpty || 
                    name.contains(_searchQuery.toLowerCase()) || 
                    desc.contains(_searchQuery.toLowerCase());
                    
                return matchCat && matchSearch;
              }).toList();

              return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Categories
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Row(
                children: _categories.map((category) {
                  final isSelected = category == _selectedCategory;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => setState(() => _selectedCategory = category),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.brandNavy : AppTheme.surfaceContainerLowest,
                          border: Border.all(color: isSelected ? AppTheme.brandNavy : AppTheme.borderSubtle),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          category,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: isSelected ? Colors.white : AppTheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            
            // Grid
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.75, // Adjust height based on content
                ),
                itemCount: _filteredEquipment.length,
                itemBuilder: (context, index) {
                  final item = _filteredEquipment[index];
                  final bool isAvailable = item['available'] ?? true;
                  final String imageUrl = (item['images'] != null && item['images'].isNotEmpty) 
                    ? item['images'][0] 
                    : 'https://via.placeholder.com/150';
                    
                  return GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                      // Directing to CreateReservationScreen as per the single-item checkout design in Stitch
                      builder: (_) => CreateReservationScreen(equipmentId: item['id']),
                    )),
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceContainerLowest,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.borderSubtle),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Image container with 16:9 aspect ratio approx
                          Expanded(
                            flex: 3,
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                Container(
                                  color: AppTheme.surfaceContainer,
                                  child: Image.network(
                                    imageUrl, 
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Icon(Icons.image_not_supported, color: AppTheme.outlineVariant),
                                  ),
                                ),
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: Container(
                                    padding: EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.9),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(Icons.favorite_border, size: 16, color: AppTheme.brandOrange),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Details
                          Expanded(
                            flex: 2,
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item['name'] ?? 'Unknown Item',
                                        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.onSurface),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.baseline,
                                        textBaseline: TextBaseline.alphabetic,
                                        children: [
                                          Text('Rs.${item['rentalPrice'] ?? 0}', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.brandOrange)),
                                          Text('/day', style: TextStyle(fontSize: 10, color: AppTheme.onSurfaceVariant)),
                                        ],
                                      ),
                                    ],
                                  ),
                                  
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isAvailable ? AppTheme.statusSuccessBg : Color(0xFFFEF9C3),
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: isAvailable ? AppTheme.statusSuccessText.withOpacity(0.2) : Color(0xFF854D0E).withOpacity(0.2)),
                                    ),
                                    child: Text(
                                      isAvailable ? 'AVAILABLE' : 'RENTED',
                                      style: TextStyle(
                                        fontSize: 8, 
                                        fontWeight: FontWeight.bold, 
                                        letterSpacing: 0.5,
                                        color: isAvailable ? AppTheme.statusSuccessText : Color(0xFF854D0E),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      }),
    );
  }
}