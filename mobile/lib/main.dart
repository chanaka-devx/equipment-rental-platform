import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/main_screen.dart';
import 'screens/my_reservations_screen.dart';
import 'screens/staff_reservations_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/account_screen.dart';
import 'services/auth_service.dart';
import 'theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final authService = AuthService();
  final loggedIn = await authService.isLoggedIn();
  runApp(MyApp(initialRoute: loggedIn ? '/home' : '/login'));
}

class MyApp extends StatelessWidget {
  final String initialRoute;
  const MyApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RentForge',
      theme: AppTheme.lightTheme,
      initialRoute: initialRoute,
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
