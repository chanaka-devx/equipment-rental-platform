import {
  Controller, VERSION_NEUTRAL, Get, Post, Patch,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DamageStatus, MaintenanceStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR')
@Controller({ path: 'inventory', version: ['1', VERSION_NEUTRAL] })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ─── Stock ────────────────────────────────────────────────────────────────

  @Get('stock')
  listStock() {
    return this.inventoryService.listEquipmentWithStock();
  }

  @Post(':id/receive')
  receiveEquipment(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventoryService.receiveEquipment(id, Number(quantity));
  }

  @Post(':id/release')
  releaseEquipment(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.inventoryService.releaseEquipment(id, Number(quantity));
  }

  // ─── Damage ───────────────────────────────────────────────────────────────

  @Post('damages')
  createDamage(
    @Body() body: { equipmentId: string; reservationItemId?: string; description: string; quantity: number },
    @Req() req,
  ) {
    return this.inventoryService.createDamage({
      ...body,
      quantity: Number(body.quantity),
      recordedById: req.user.userId,
    });
  }

  @Get('damages')
  listDamages(
    @Query('equipmentId') equipmentId?: string,
    @Query('status') status?: DamageStatus,
  ) {
    return this.inventoryService.listDamages(equipmentId, status);
  }

  @Patch('damages/:id/status')
  updateDamageStatus(@Param('id') id: string, @Body('status') status: DamageStatus) {
    return this.inventoryService.updateDamageStatus(id, status);
  }

  // ─── Maintenance ──────────────────────────────────────────────────────────

  @Post('maintenance')
  createMaintenance(
    @Body() body: { equipmentId: string; description: string; quantity: number },
    @Req() req,
  ) {
    return this.inventoryService.createMaintenance({
      ...body,
      quantity: Number(body.quantity),
      recordedById: req.user.userId,
    });
  }

  @Get('maintenance')
  listMaintenance(
    @Query('equipmentId') equipmentId?: string,
    @Query('status') status?: MaintenanceStatus,
  ) {
    return this.inventoryService.listMaintenance(equipmentId, status);
  }

  @Patch('maintenance/:id/status')
  updateMaintenanceStatus(@Param('id') id: string, @Body('status') status: MaintenanceStatus) {
    return this.inventoryService.updateMaintenanceStatus(id, status);
  }
}

