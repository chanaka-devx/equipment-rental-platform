import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithItems(
    userId: string,
    startDate: Date,
    endDate: Date,
    items: { equipmentId: string; quantity: number; unitPrice: number }[],
  ) {
    return this.prisma.reservation.create({
      data: {
        userId,
        startDate,
        endDate,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { equipment: true } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        items: { include: { equipment: true } },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
    });
  }

  findByUser(userId: string, skip: number, take: number) {
    return this.prisma.reservation.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { equipment: true } } },
    });
  }

  async findAll(where: any, skip: number, take: number) {
    const [items, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { equipment: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);
    return { items, total };
  }

  updateStatus(id: string, status: ReservationStatus) {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }
}