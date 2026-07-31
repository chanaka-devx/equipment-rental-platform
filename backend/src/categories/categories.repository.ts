import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.category.findMany(); }
  findById(id: string) { return this.prisma.category.findUnique({ where: { id } }); }
  create(name: string) { return this.prisma.category.create({ data: { name } }); }
  update(id: string, name: string) { return this.prisma.category.update({ where: { id }, data: { name } }); }
  delete(id: string) { return this.prisma.category.delete({ where: { id } }); }
}