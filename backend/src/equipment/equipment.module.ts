import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EquipmentRepository } from './equipment.repository';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [EquipmentController],
  providers: [EquipmentService, EquipmentRepository],
  exports: [EquipmentRepository],
})
export class EquipmentModule {}
