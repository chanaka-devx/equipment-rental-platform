import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('payments')
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
