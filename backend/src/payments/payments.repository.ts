import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(reservationId: string, amount: number) {
    return this.prisma.payment.create({
      data: { reservationId, amount, status: 'PENDING' },
    });
  }

  findByReservation(reservationId: string) {
    return this.prisma.payment.findUnique({ where: { reservationId } });
  }

  updateStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({ where: { id }, data: { status } });
  }
}