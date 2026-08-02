import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { ReservationsRepository } from '../reservations/reservations.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async initiatePayment(reservationId: string) {
    const reservation = await this.reservationsRepository.findById(reservationId);
    if (!reservation) throw new NotFoundException('Reservation not found');

    const amount = reservation.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    return this.paymentsRepository.create(reservationId, amount);
  }

  async simulatePaymentResult(paymentId: string, outcome: 'PAID' | 'FAILED') {
    return this.paymentsRepository.updateStatus(paymentId, outcome);
  }

  async refund(paymentId: string) {
    return this.paymentsRepository.updateStatus(paymentId, 'REFUNDED');
  }
}
