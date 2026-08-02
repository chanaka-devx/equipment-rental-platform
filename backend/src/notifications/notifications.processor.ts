import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsRepository } from './notifications.repository';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  constructor(private notificationsRepository: NotificationsRepository) {
    super();
  }

  async process(job: Job) {
    const { userId, message } = job.data;
    await this.notificationsRepository.create(userId, message);
    console.log(`Notification created for user ${userId}: ${message}`);
  }
}