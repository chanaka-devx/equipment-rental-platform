import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    private notificationsRepository: NotificationsRepository,
  ) {}

  async queueNotification(userId: string, message: string) {
    await this.notificationsQueue.add('send-notification', { userId, message });
  }

  async findMyNotifications(userId: string) {
    return this.notificationsRepository.findByUser(userId);
  }
}