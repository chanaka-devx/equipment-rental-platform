import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../services/auth_service.dart';
import '../theme.dart';
class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}
class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final authService = AuthService();
  String? error;
  bool _isLoading = false;
  void _login() async {
    setState(() {
      error = null;
      _isLoading = true;
    });
    
    try {
      await authService.login(emailController.text, passwordController.text);
      Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      setState(() => error = 'Login failed. Check your credentials.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceContainerLowest,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo from assets
                SvgPicture.asset(
                  'assets/images/logo2.svg',
                  height: 48,
                ),
                const SizedBox(height: 32),
                
                // Form Container
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceContainerLowest,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.borderSubtle),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Sign In',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppTheme.brandNavy),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Welcome to RentForge.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant),
                      ),
                      const SizedBox(height: 24),
                      
                      Text('Email Address', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.outline)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: 'Enter your email',
                          prefixIcon: Icon(Icons.mail_outline, color: AppTheme.outline),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      Text('Password', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.outline)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          hintText: '••••••••',
                          prefixIcon: Icon(Icons.lock_outline, color: AppTheme.outline),
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: Text(
                            'Forgot Password?',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.brandOrange),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      if (error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppTheme.statusSuccessBg.withOpacity(0.5), // Using a generic error color
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.error_outline, color: Colors.red, size: 20),
                                SizedBox(width: 8),
                                Expanded(child: Text(error!, style: TextStyle(color: Colors.red))),
                              ],
                            ),
                          ),
                        ),
                      
                      ElevatedButton(
                        onPressed: _isLoading ? null : _login,
                        child: _isLoading 
                          ? SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text('Sign In'),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Don\'t have an account? ', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant)),
                    GestureDetector(
                      onTap: () {
                        Navigator.pushNamed(context, '/register');
                      },
                      child: Text('Register', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.brandOrange, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}