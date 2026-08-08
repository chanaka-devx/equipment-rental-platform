import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { DamageStatus, MaintenanceStatus } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  // ─── Stock ────────────────────────────────────────────────────────────────

  listEquipmentWithStock() {
    return this.inventoryRepository.listEquipmentWithStock();
  }

  receiveEquipment(equipmentId: string, quantity: number) {
    return this.inventoryRepository.adjustStock(equipmentId, quantity);
  }

  releaseEquipment(equipmentId: string, quantity: number) {
    return this.inventoryRepository.adjustStock(equipmentId, -quantity);
  }

  // ─── Damage ───────────────────────────────────────────────────────────────

  createDamage(data: {
    equipmentId: string;
    reservationItemId?: string;
    description: string;
    quantity: number;
    recordedById: string;
  }) {
    return this.inventoryRepository.createDamage(data);
  }

  listDamages(equipmentId?: string, status?: DamageStatus) {
    return this.inventoryRepository.listDamages(equipmentId, status);
  }

  updateDamageStatus(id: string, status: DamageStatus) {
    return this.inventoryRepository.updateDamageStatus(id, status);
  }

  // ─── Maintenance ──────────────────────────────────────────────────────────

  createMaintenance(data: {
    equipmentId: string;
    description: string;
    quantity: number;
    recordedById: string;
  }) {
    return this.inventoryRepository.createMaintenance(data);
  }

  listMaintenance(equipmentId?: string, status?: MaintenanceStatus) {
    return this.inventoryRepository.listMaintenance(equipmentId, status);
  }

  updateMaintenanceStatus(id: string, status: MaintenanceStatus) {
    return this.inventoryRepository.updateMaintenanceStatus(id, status);
  }
}

