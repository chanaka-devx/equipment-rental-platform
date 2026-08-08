import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DamageStatus, MaintenanceStatus } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Stock ────────────────────────────────────────────────────────────────

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

  async listEquipmentWithStock() {
    return this.prisma.equipment.findMany({
      select: {
        id: true,
        name: true,
        images: true,
        stockQuantity: true,
        available: true,
        category: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ─── Damage ───────────────────────────────────────────────────────────────

  async createDamage(data: {
    equipmentId: string;
    reservationItemId?: string;
    description: string;
    quantity: number;
    recordedById: string;
  }) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id: data.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment not found');
    if (equipment.stockQuantity < data.quantity)
      throw new BadRequestException('Not enough stock to mark as damaged');

    return this.prisma.$transaction([
      this.prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { stockQuantity: { decrement: data.quantity } },
      }),
      this.prisma.equipmentDamage.create({ data }),
    ]);
  }

  async listDamages(equipmentId?: string, status?: DamageStatus) {
    return this.prisma.equipmentDamage.findMany({
      where: {
        ...(equipmentId ? { equipmentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        equipment: { select: { id: true, name: true, images: true } },
        recordedBy: { select: { id: true, name: true } },
        reservationItem: { select: { id: true, reservationId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDamageStatus(id: string, status: DamageStatus) {
    const record = await this.prisma.equipmentDamage.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Damage record not found');

    const updates: any[] = [
      this.prisma.equipmentDamage.update({ where: { id }, data: { status } }),
    ];

    // Only restore stock when transitioning to REPAIRED
    if (status === DamageStatus.REPAIRED && record.status !== DamageStatus.REPAIRED) {
      updates.push(
        this.prisma.equipment.update({
          where: { id: record.equipmentId },
          data: { stockQuantity: { increment: record.quantity } },
        }),
      );
    }

    return this.prisma.$transaction(updates);
  }

  // ─── Maintenance ──────────────────────────────────────────────────────────

  async createMaintenance(data: {
    equipmentId: string;
    description: string;
    quantity: number;
    recordedById: string;
  }) {
    const equipment = await this.prisma.equipment.findUnique({ where: { id: data.equipmentId } });
    if (!equipment) throw new NotFoundException('Equipment not found');
    if (equipment.stockQuantity < data.quantity)
      throw new BadRequestException('Not enough stock to send for maintenance');

    return this.prisma.$transaction([
      this.prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { stockQuantity: { decrement: data.quantity } },
      }),
      this.prisma.maintenanceRecord.create({ data }),
    ]);
  }

  async listMaintenance(equipmentId?: string, status?: MaintenanceStatus) {
    return this.prisma.maintenanceRecord.findMany({
      where: {
        ...(equipmentId ? { equipmentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        equipment: { select: { id: true, name: true, images: true } },
        recordedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMaintenanceStatus(id: string, status: MaintenanceStatus) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Maintenance record not found');

    const updates: any[] = [
      this.prisma.maintenanceRecord.update({ where: { id }, data: { status } }),
    ];

    // Restore stock when maintenance is COMPLETED
    if (status === MaintenanceStatus.COMPLETED && record.status !== MaintenanceStatus.COMPLETED) {
      updates.push(
        this.prisma.equipment.update({
          where: { id: record.equipmentId },
          data: { stockQuantity: { increment: record.quantity } },
        }),
      );
    }

    return this.prisma.$transaction(updates);
  }
}

