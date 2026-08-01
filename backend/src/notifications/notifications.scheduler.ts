import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationsRepository } from 'src/reservations/reservations.repository';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  constructor(
    private reservationsRepository: ReservationsRepository,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkUpcomingReturns() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueSoon = await this.reservationsRepository.findAll(
      { status: 'ACTIVE', endDate: { lte: tomorrow } }, 0, 100,
    );

    for (const reservation of dueSoon.items) {
      await this.notificationsService.queueNotification(
        reservation.userId,
        `Reminder: your rental is due back tomorrow.`,
      );
    }
  }
}