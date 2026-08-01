import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsScheduler } from './notifications.scheduler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ReservationsModule),
    BullModule.registerQueue({ name: 'notifications' })],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, NotificationsProcessor, NotificationsScheduler],
  exports: [NotificationsRepository, NotificationsService]
})
export class NotificationsModule { }

