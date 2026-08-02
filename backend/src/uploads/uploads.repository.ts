import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, type: string, url: string) {
    return this.prisma.upload.create({ data: { userId, type, url } });
  }

  findByUser(userId: string) {
    return this.prisma.upload.findMany({ where: { userId } });
  }
}