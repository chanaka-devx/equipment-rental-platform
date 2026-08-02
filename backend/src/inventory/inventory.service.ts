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

  async recordDamage(equipmentId: string, note: string, userId: string) {
    await this.inventoryRepository.setAvailability(equipmentId, false); // ties back to Day 3's "available" decision
    await this.logAction(userId, 'DAMAGE_RECORDED', { equipmentId, note });
  }

  async recordMaintenance(equipmentId: string, note: string, userId: string) {
    await this.inventoryRepository.setAvailability(equipmentId, true); // back in service
    await this.logAction(userId, 'MAINTENANCE_COMPLETED', { equipmentId, note });
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
