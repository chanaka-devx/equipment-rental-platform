import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) { }

  create(userId: string, message: string) {
    return this.prisma.notification.create({ data: { userId, message } });
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}