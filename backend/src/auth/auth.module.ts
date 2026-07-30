import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from './strategies/jwt/jwt.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'secret',
      signOptions: { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService]
})
export class AuthModule {}
