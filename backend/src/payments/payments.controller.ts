import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':reservationId/initiate')
  initiate(@Param('reservationId') id: string) { return this.paymentsService.initiatePayment(id); }

  @Patch(':id/simulate')
  simulate(@Param('id') id: string, @Body('outcome') outcome: 'PAID' | 'FAILED') {
    return this.paymentsService.simulatePaymentResult(id, outcome);
  }

  @Patch(':id/refund')
  @Roles('ADMIN', 'STAFF')
  refund(@Param('id') id: string) { return this.paymentsService.refund(id); }
}

