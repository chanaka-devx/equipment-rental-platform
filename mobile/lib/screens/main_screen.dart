import 'package:flutter/material.dart';
import 'equipment_list_screen.dart';
import 'cart_screen.dart';
import 'account_screen.dart';
import 'staff_reservations_screen.dart';
import '../widgets/custom_bottom_nav_bar.dart';
import '../services/auth_service.dart';

class MainScreen extends StatefulWidget {
  final int initialIndex;
  
  const MainScreen({super.key, this.initialIndex = 0});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late int _currentIndex;
  bool _isStaff = false;
  bool _isLoading = true;
  final _cartKey = GlobalKey<CartScreenState>();

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _checkRole();
  }

  Future<void> _checkRole() async {
    final userData = await AuthService().getUserInfo();
    setState(() {
      _isStaff = userData['role'] == 'STAFF' || userData['role'] == 'ADMIN';
      _isLoading = false;
    });
  }

  int get _cartTabIndex => _isStaff ? 2 : 1;

  List<Widget> get _screens {
    final cartScreen = CartScreen(key: _cartKey);
    if (_isStaff) {
      return [
        EquipmentListScreen(),
        const StaffReservationsScreen(),
        cartScreen,
        const AccountScreen(),
      ];
    } else {
      return [
        EquipmentListScreen(),
        cartScreen,
        const AccountScreen(),
      ];
    }
  }

  void _onTabTap(int index) {
    // If the cart tab is tapped, always reload the cart data
    if (index == _cartTabIndex) {
      _cartKey.currentState?.loadCart();
    }
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        isStaff: _isStaff,
        onTap: _onTabTap,
      ),
    );
  }
}
