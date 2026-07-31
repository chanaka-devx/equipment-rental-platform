import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoriesRepository.create(createCategoryDto.name);
  }

  findAll() {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Ensure it exists
    if (!updateCategoryDto.name) {
      throw new BadRequestException('Name is required to update a category');
    }
    return this.categoriesRepository.update(id, updateCategoryDto.name);
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists
    return this.categoriesRepository.delete(id);
  }
}
