import { Controller, Post, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF', 'WAREHOUSE_OPERATOR')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':id/receive')
  receiveEquipment(@Param('id') id: string, @Body('quantity', ParseIntPipe) quantity: number, @Req() req) {
    return this.inventoryService.receiveEquipment(id, quantity, req.user.userId);
  }

  @Post(':id/release')
  releaseEquipment(@Param('id') id: string, @Body('quantity', ParseIntPipe) quantity: number, @Req() req) {
    return this.inventoryService.releaseEquipment(id, quantity, req.user.userId);
  }

  @Post(':id/damage')
  recordDamage(@Param('id') id: string, @Body('note') note: string, @Req() req) {
    return this.inventoryService.recordDamage(id, note, req.user.userId);
  }

  @Post(':id/maintenance')
  recordMaintenance(@Param('id') id: string, @Body('note') note: string, @Req() req) {
    return this.inventoryService.recordMaintenance(id, note, req.user.userId);
  }
}
