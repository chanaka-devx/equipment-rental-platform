import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async receiveEquipment(equipmentId: string, quantity: number, userId: string) {
    await this.inventoryRepository.adjustStock(equipmentId, quantity); // increase total owned
    await this.logAction(userId, 'INVENTORY_RECEIVED', { equipmentId, quantity });
  }

  async releaseEquipment(equipmentId: string, quantity: number, userId: string) {
    await this.inventoryRepository.adjustStock(equipmentId, -quantity); // e.g. sold off, decommissioned
    await this.logAction(userId, 'INVENTORY_RELEASED', { equipmentId, quantity });
  }

  async recordDamage(equipmentId: string, note: string, userId: string, quantity: number = 1) {
    await this.inventoryRepository.adjustStock(equipmentId, -quantity); 
    await this.logAction(userId, 'DAMAGE_RECORDED', { equipmentId, note, quantity });
  }

  async recordMaintenance(equipmentId: string, note: string, userId: string, quantity: number = 1) {
    await this.inventoryRepository.adjustStock(equipmentId, quantity); 
    await this.logAction(userId, 'MAINTENANCE_COMPLETED', { equipmentId, note, quantity });
  }

  private async logAction(userId: string, action: string, details: any) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }
}
