import { Controller, VERSION_NEUTRAL, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller({ version: ['1', VERSION_NEUTRAL] })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  getAdminData(@Request() req) {
    return { message: 'You have admin access!', user: req.user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STAFF', 'ADMIN')
  @Get('staff-only')
  getStaffData(@Request() req) {
    return { message: 'You have staff/admin access!', user: req.user };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Get('customer-only')
  getCustomerData(@Request() req) {
    return { message: 'You have customer access!', user: req.user };
  }
}
