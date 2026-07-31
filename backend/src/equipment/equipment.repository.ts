import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEquipmentDto) {
    return this.prisma.equipment.create({ data: dto });
  }

  findById(id: string) {
    return this.prisma.equipment.findUnique({ where: { id }, include: { category: true } });
  }

  async findAll(where: any, skip: number, take: number) {
    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({ where, skip, take, include: { category: true } }),
      this.prisma.equipment.count({ where }),
    ]);
    return { items, total };
  }

  update(id: string, dto: UpdateEquipmentDto) {
    return this.prisma.equipment.update({ where: { id }, data: dto });
  }

  delete(id: string) {
    return this.prisma.equipment.delete({ where: { id } });
  }

  async getBookedQuantity(equipmentId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.reservationItem.aggregate({
      where: {
        equipmentId,
        reservation: {
          status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }
}