import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async adjustStock(equipmentId: string, quantity: number) {
    return this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { stockQuantity: { increment: quantity } },
    });
  }

  async setAvailability(equipmentId: string, available: boolean) {
    return this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { available },
    });
  }
}
