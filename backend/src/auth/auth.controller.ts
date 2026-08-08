import { Controller, VERSION_NEUTRAL, Post, Get, Patch, Body, Logger, Request, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller({ path: 'auth', version: ['1', VERSION_NEUTRAL] })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Registration failed', error?.message, error?.stack);
      throw error;
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/documents')
  async updateDocuments(
    @Request() req,
    @Body() body: { documents: Record<string, string> },
  ) {
    return this.authService.updateDocuments(req.user.userId, body.documents);
  }
}
