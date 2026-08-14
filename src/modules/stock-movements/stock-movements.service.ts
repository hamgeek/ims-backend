import { AppError } from '../../exceptions/app-error';
import prisma from '../../lib/db';
import { CreateStockMovementInput } from './stock-movements.contract';

export abstract class StockMovementService {
  static async findAll() {
    return prisma.stockMovement.findMany({
      include: {
        product: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id: string) {
    return prisma.stockMovement.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
        user: true,
      },
    });
  }

  static async findByProduct(productId: string) {
    return prisma.stockMovement.findMany({
      where: {
        productId,
      },
      include: {
        product: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async create(data: CreateStockMovementInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: data.productId,
        },
      });

      if (!product) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Produk tidak ditemukan.');
      }

      const stockBefore = product.stock;

      let stockAfter = stockBefore;

      switch (data.type) {
        case 'IN':
          stockAfter += data.quantity;
          break;

        case 'OUT':
          stockAfter -= data.quantity;
          break;

        case 'ADJUSTMENT':
          stockAfter = data.quantity;
          break;
      }

      if (stockAfter < 0) {
        throw new AppError(400, 'INSUFFICIENT_STOCK', 'Stok tidak mencukupi.');
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId,

          type: data.type,
          quantity: data.quantity,

          stockBefore,
          stockAfter,

          note: data.note,
        },
        include: {
          product: true,
          user: true,
        },
      });

      await tx.product.update({
        where: {
          id: data.productId,
        },
        data: {
          stock: stockAfter,
        },
      });

      return movement;
    });
  }
}
