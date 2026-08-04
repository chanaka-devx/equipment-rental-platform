import 'package:flutter/material.dart';

class EquipmentDetailScreen extends StatelessWidget {
  final dynamic equipmentId;
  const EquipmentDetailScreen({super.key, required this.equipmentId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Equipment Detail')),
      body: Center(child: Text('Detail for Equipment $equipmentId')),
    );
  }
}
