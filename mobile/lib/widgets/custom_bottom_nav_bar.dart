import 'package:flutter/material.dart';
import '../theme.dart';

class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final bool isStaff;

  const CustomBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.isStaff = false,
  });

  @override
  Widget build(BuildContext context) {
    final items = <BottomNavigationBarItem>[
      const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
      if (isStaff) const BottomNavigationBarItem(icon: Icon(Icons.event_note), label: 'Reservations'),
      const BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Cart'),
      const BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Account'),
    ];

    return BottomNavigationBar(
      backgroundColor: AppTheme.surfaceContainerLowest,
      selectedItemColor: AppTheme.brandOrange,
      unselectedItemColor: AppTheme.outline,
      selectedLabelStyle: Theme.of(context).textTheme.labelSmall,
      unselectedLabelStyle: Theme.of(context).textTheme.labelSmall,
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex,
      onTap: onTap,
      items: items,
    );
  }
}
