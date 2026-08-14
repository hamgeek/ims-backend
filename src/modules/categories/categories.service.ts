import prisma from '../../lib/db';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.contract';

export abstract class CategoryService {
  static async findAll() {
    return prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id: string) {
    return prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  static async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
    });
  }

  static async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  }
}
