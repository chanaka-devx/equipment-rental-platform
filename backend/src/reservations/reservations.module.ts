import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { ReservationsRepository } from './reservations.repository';

@Module({
  imports: [PrismaModule, EquipmentModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
