import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color brandOrange = Color(0xFFF97316);
  static const Color brandNavy = Color(0xFF0F172A);
  
  // Surface & Background Colors
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainer = Color(0xFFF0EDEF);
  static const Color background = Color(0xFFF8FAFC);
  
  // Text Colors
  static const Color onSurface = Color(0xFF1B1B1D);
  static const Color onSurfaceVariant = Color(0xFF45464D);
  static const Color outline = Color(0xFF76777D);
  static const Color outlineVariant = Color(0xFFC6C6CD);
  static const Color borderSubtle = Color(0xFFE2E8F0);

  // Status Colors
  static const Color statusSuccessBg = Color(0xFFDCFCE7);
  static const Color statusSuccessText = Color(0xFF166534);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: brandOrange,
        secondary: brandNavy,
        background: background,
        surface: surfaceContainerLowest,
        onSurface: onSurface,
        onBackground: onSurface,
        error: Colors.red,
      ),
      scaffoldBackgroundColor: background,
      textTheme: GoogleFonts.hankenGroteskTextTheme().copyWith(
        displayLarge: GoogleFonts.hankenGrotesk(fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -0.02, height: 40/32),
        displayMedium: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: -0.01, height: 32/24),
        titleLarge: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.w600, height: 28/20),
        bodyLarge: GoogleFonts.hankenGrotesk(fontSize: 16, fontWeight: FontWeight.normal, height: 24/16),
        bodyMedium: GoogleFonts.hankenGrotesk(fontSize: 14, fontWeight: FontWeight.normal, height: 20/14),
        labelSmall: GoogleFonts.hankenGrotesk(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.02, height: 16/12),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceContainerLowest,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: brandOrange),
        ),
        hintStyle: TextStyle(color: outlineVariant),
        labelStyle: TextStyle(color: outline),
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brandOrange,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: EdgeInsets.symmetric(vertical: 16),
          textStyle: GoogleFonts.hankenGrotesk(fontSize: 14, fontWeight: FontWeight.bold),
          elevation: 1,
        ),
      ),
    );
  }
}
