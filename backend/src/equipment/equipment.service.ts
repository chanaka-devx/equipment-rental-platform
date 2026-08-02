import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentRepository } from './equipment.repository';

@Injectable()
export class EquipmentService {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async create(dto: CreateEquipmentDto) {
    return this.equipmentRepository.create(dto);
  }

  async findOne(id: string) {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  async findAll(query: any) {
    const page = +query.page || 1;
    const limit = +query.limit || 10;

    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
    if (query.minPrice || query.maxPrice) {
      where.rentalPrice = {};
      if (query.minPrice) where.rentalPrice.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.rentalPrice.lte = parseFloat(query.maxPrice);
    }

    const { items, total } = await this.equipmentRepository.findAll(
      where,
      (page - 1) * limit,
      limit,
    );

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.findOne(id); // throws 404 if it doesn't exist
    return this.equipmentRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.equipmentRepository.delete(id);
  }
}