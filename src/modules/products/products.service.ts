import prisma from '../../lib/db';
import { CreateProductInput, UpdateProductInput } from './products.contract';

export abstract class ProductService {
  static async findAll() {
    return prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id: string) {
    return prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });
  }

  static async create(createdBy: string, data: CreateProductInput) {
    return prisma.product.create({
      data: {
        createdBy,
        ...data,
      },
      include: {
        category: true,
      },
    });
  }

  static async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: {
        id,
      },
      data,
      include: {
        category: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
