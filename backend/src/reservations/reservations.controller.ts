import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReservationStatus } from '@prisma/client';
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Req() req, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(req.user.userId, createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('my-reservations')
  findMyReservations(@Req() req) {
    return this.reservationsService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req) {
    return this.reservationsService.cancel(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReservationStatus,
  ) {
    return this.reservationsService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR')
  @Patch(':id/release')
  release(@Param('id') id: string) {
    return this.reservationsService.releaseReservation(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR')
  @Post(':id/return')
  returnItems(
    @Param('id') id: string,
    @Body('returns') returns: { equipmentId: string; qtyGood: number; qtyDamaged: number; note?: string }[],
    @Req() req
  ) {
    return this.reservationsService.returnItems(id, returns, req.user.userId);
  }
}
