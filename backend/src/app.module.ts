import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { EquipmentModule } from './equipment/equipment.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { InventoryModule } from './inventory/inventory.module';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from './notifications/notifications.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDISHOST,
        port: Number(process.env.REDISPORT),
        password: process.env.REDISPASSWORD,
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    ScheduleModule.forRoot(),
    AuthModule, PrismaModule, CategoriesModule, EquipmentModule, UploadsModule, ReservationsModule, PaymentsModule, InventoryModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
