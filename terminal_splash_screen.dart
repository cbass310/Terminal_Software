import 'dart:async';
import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// TERMINAL SPLASH SCREEN
// Branding: Terminal Software - Execute Your Vision
// ---------------------------------------------------------------------------

class TerminalSplashScreen extends StatefulWidget {
  final Widget nextScreen;

  const TerminalSplashScreen({super.key, required this.nextScreen});

  @override
  State<TerminalSplashScreen> createState() => _TerminalSplashScreenState();
}

class _TerminalSplashScreenState extends State<TerminalSplashScreen> {
  // CONFIGURATION
  final String _brandName = "Terminal Software";
  final String _tagline = "Execute Your Vision";
  final Duration _typingSpeed = const Duration(milliseconds: 100);
  final Duration _startDelay = const Duration(seconds: 1);
  final Duration _pauseBetweenLines = const Duration(milliseconds: 800);
  final Duration _endDelay = const Duration(seconds: 2);

  // STATE VARIABLES
  String _displayBrand = "";
  String _displayTagline = "";
  bool _showCursor = true;
  bool _typingBrand = false;
  bool _typingTagline = false;
  Timer? _cursorTimer;

  @override
  void initState() {
    super.initState();
    _startCursorBlink();
    _startAnimationSequence();
  }

  @override
  void dispose() {
    _cursorTimer?.cancel();
    super.dispose();
  }

  // LOGIC
  void _startCursorBlink() {
    _cursorTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      setState(() {
        _showCursor = !_showCursor;
      });
    });
  }

  Future<void> _startAnimationSequence() async {
    // 1. Initial Delay
    await Future.delayed(_startDelay);

    // 2. Type out Brand Name
    setState(() => _typingBrand = true);
    for (int i = 0; i < _brandName.length; i++) {
      await Future.delayed(_typingSpeed);
      if (!mounted) return;
      setState(() {
        _displayBrand = _brandName.substring(0, i + 1);
      });
    }
    setState(() => _typingBrand = false);

    // 3. Pause
    await Future.delayed(_pauseBetweenLines);

    // 4. Type out Tagline
    setState(() => _typingTagline = true);
    for (int i = 0; i < _tagline.length; i++) {
      await Future.delayed(_typingSpeed);
      if (!mounted) return;
      setState(() {
        _displayTagline = _tagline.substring(0, i + 1);
      });
    }
    setState(() => _typingTagline = false);

    // 5. Final Hold before navigation
    await Future.delayed(_endDelay);
    if (!mounted) return;
    _navigateToHome();
  }

  void _navigateToHome() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => widget.nextScreen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 800),
      ),
    );
  }

  // UI
  @override
  Widget build(BuildContext context) {
    const Color terminalGreen = Color(0xFF00FF41); 

    return Scaffold(
      backgroundColor: Colors.black, 
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0), // Padding for edges
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // BRAND NAME ROW (Responsive)
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _displayBrand,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 32, // Large font, but safe due to FittedBox
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.5,
                      ),
                    ),
                    if (_typingBrand && _showCursor)
                      _buildCursor(32, terminalGreen),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // TAGLINE ROW
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _displayTagline,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 18,
                        fontStyle: FontStyle.italic,
                        color: Colors.grey, 
                      ),
                    ),
                    if ((_typingTagline || (!_typingBrand && !_typingTagline)) && _showCursor)
                      _buildCursor(18, terminalGreen),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCursor(double height, Color color) {
    return Container(
      width: 10,
      height: height,
      color: color,
      margin: const EdgeInsets.only(left: 4),
    );
  }
}
