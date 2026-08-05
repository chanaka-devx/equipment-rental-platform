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
    // Define the items internally to easily map to custom widgets
    final navItems = [
      {'icon': Icons.home, 'label': 'Home'},
      if (isStaff) {'icon': Icons.event_note, 'label': 'Reserved'},
      {'icon': Icons.shopping_cart, 'label': 'Cart'},
      {'icon': Icons.person, 'label': 'Profile'},
    ];

    return SafeArea(
      child: Container(
        margin: const EdgeInsets.only(left: 32, right: 32, bottom: 16),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: AppTheme.outline.withOpacity(0.2)),
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: navItems.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            final isSelected = index == currentIndex;
            
            return GestureDetector(
              onTap: () => onTap(index),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      item['icon'] as IconData,
                      color: isSelected ? AppTheme.brandOrange : AppTheme.outline,
                      size: 20,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item['label'] as String,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: isSelected ? AppTheme.brandOrange : AppTheme.outline,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
