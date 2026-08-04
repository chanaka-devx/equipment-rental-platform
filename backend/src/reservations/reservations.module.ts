import { Module, forwardRef } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { ReservationsRepository } from './reservations.repository';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, EquipmentModule, forwardRef(() => NotificationsModule)],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
  exports: [ReservationsRepository, ReservationsService],
})
export class ReservationsModule {}
