import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { EquipmentModule } from './equipment/equipment.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [AuthModule, PrismaModule, CategoriesModule, EquipmentModule, UploadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
