import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Check if the user already exists
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    // Remove the password from the returned object
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    // 3. Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
          expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
        },
      ),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret' });
      const user = await this.userRepository.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        { secret: process.env.JWT_ACCESS_SECRET || 'secret', expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any },
      );
      return { access_token: accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return { message: 'If that email exists, a reset link was sent.' }; // don't leak existence

    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { secret: process.env.JWT_ACCESS_SECRET || 'secret', expiresIn: '15m' },
    );

    console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    return { message: 'If that email exists, a reset link was sent.' };
  }
}
