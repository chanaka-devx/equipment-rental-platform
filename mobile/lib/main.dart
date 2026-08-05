import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/main_screen.dart';
import 'screens/equipment_list_screen.dart';
import 'screens/my_reservations_screen.dart';
import 'screens/staff_reservations_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/account_screen.dart';
import 'theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Equipment Rental Platform',
      theme: AppTheme.lightTheme,
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
        '/home': (context) => const MainScreen(),
        '/my-reservations': (context) => MyReservationsScreen(),
        '/staff-reservations': (context) => const StaffReservationsScreen(),
        '/notifications': (context) => const NotificationsScreen(),
        '/account': (context) => const AccountScreen(),
      },
    );
  }
}
