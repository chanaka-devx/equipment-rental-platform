import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateDocuments(userId: string, newDocs: Record<string, string>): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const existing = (user?.uploadedDocuments as Record<string, string>) ?? {};
    const merged = { ...existing, ...newDocs };
    return this.prisma.user.update({
      where: { id: userId },
      data: { uploadedDocuments: merged },
    });
  }
}
