import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StockMovementService } from '../../modules/stock-movements/stock-movements.service';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    stockMovement: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },

    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },

    $transaction: vi.fn(),
  },
}));

vi.mock('../../lib/db', () => ({
  default: prismaMock,
}));

describe('StockMovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('harus mengembalikan semua pergerakan stok', async () => {
      const movements = [
        {
          id: 'movement-1',
          productId: 'product-1',
          userId: 'user-1',
          type: 'IN',
          quantity: 10,
          stockBefore: 0,
          stockAfter: 10,
          note: 'Stok masuk',
          createdAt: new Date(),
          product: {
            id: 'product-1',
            name: 'Keyboard',
          },
          user: {
            id: 'user-1',
            name: 'Admin',
          },
        },
      ];

      prismaMock.stockMovement.findMany.mockResolvedValue(movements);

      const result = await StockMovementService.findAll();

      expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith({
        include: {
          product: true,
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(movements);
    });
  });

  describe('findById', () => {
    it('harus mengembalikan pergerakan stok berdasarkan ID', async () => {
      const movement = {
        id: 'movement-1',
        productId: 'product-1',
        userId: 'user-1',
        type: 'IN',
        quantity: 10,
        stockBefore: 0,
        stockAfter: 10,
        note: 'Stok masuk',
        product: {
          id: 'product-1',
          name: 'Keyboard',
        },
        user: {
          id: 'user-1',
          name: 'Admin',
        },
      };

      prismaMock.stockMovement.findUnique.mockResolvedValue(movement);

      const result = await StockMovementService.findById('movement-1');

      expect(prismaMock.stockMovement.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'movement-1',
        },
        include: {
          product: true,
          user: true,
        },
      });

      expect(result).toEqual(movement);
    });

    it('harus mengembalikan null jika pergerakan stok tidak ditemukan', async () => {
      prismaMock.stockMovement.findUnique.mockResolvedValue(null);

      const result = await StockMovementService.findById('movement-tidak-ada');

      expect(result).toBeNull();
    });
  });

  describe('findByProduct', () => {
    it('harus mengembalikan pergerakan stok berdasarkan produk', async () => {
      const movements = [
        {
          id: 'movement-1',
          productId: 'product-1',
          userId: 'user-1',
          type: 'IN',
          quantity: 10,
          stockBefore: 0,
          stockAfter: 10,
          note: 'Stok masuk',
        },
        {
          id: 'movement-2',
          productId: 'product-1',
          userId: 'user-1',
          type: 'OUT',
          quantity: 3,
          stockBefore: 10,
          stockAfter: 7,
          note: 'Stok keluar',
        },
      ];

      prismaMock.stockMovement.findMany.mockResolvedValue(movements);

      const result = await StockMovementService.findByProduct('product-1');

      expect(prismaMock.stockMovement.findMany).toHaveBeenCalledWith({
        where: {
          productId: 'product-1',
        },
        include: {
          product: true,
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(movements);
    });
  });

  describe('create', () => {
    it('harus menambah stok untuk tipe IN', async () => {
      const product = {
        id: 'product-1',
        stock: 10,
      };

      const movement = {
        id: 'movement-1',
        productId: 'product-1',
        userId: 'user-1',
        type: 'IN',
        quantity: 5,
        stockBefore: 10,
        stockAfter: 15,
        note: 'Stok masuk',
        product,
        user: {
          id: 'user-1',
          name: 'Admin',
        },
      };

      const tx = {
        product: {
          findUnique: vi.fn().mockResolvedValue(product),
          update: vi.fn().mockResolvedValue({
            ...product,
            stock: 15,
          }),
        },

        stockMovement: {
          create: vi.fn().mockResolvedValue(movement),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await StockMovementService.create(
        {
          productId: 'product-1',
          type: 'IN',
          quantity: 5,
          note: 'Stok masuk',
        },
        'user-1',
      );

      expect(tx.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
      });

      expect(tx.stockMovement.create).toHaveBeenCalledWith({
        data: {
          productId: 'product-1',
          userId: 'user-1',
          type: 'IN',
          quantity: 5,
          stockBefore: 10,
          stockAfter: 15,
          note: 'Stok masuk',
        },
        include: {
          product: true,
          user: true,
        },
      });

      expect(tx.product.update).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
        data: {
          stock: 15,
        },
      });

      expect(result).toEqual(movement);
    });

    it('harus mengurangi stok untuk tipe OUT', async () => {
      const product = {
        id: 'product-1',
        stock: 10,
      };

      const movement = {
        id: 'movement-1',
        productId: 'product-1',
        userId: 'user-1',
        type: 'OUT',
        quantity: 3,
        stockBefore: 10,
        stockAfter: 7,
        note: 'Stok keluar',
      };

      const tx = {
        product: {
          findUnique: vi.fn().mockResolvedValue(product),
          update: vi.fn().mockResolvedValue({
            ...product,
            stock: 7,
          }),
        },

        stockMovement: {
          create: vi.fn().mockResolvedValue(movement),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await StockMovementService.create(
        {
          productId: 'product-1',
          type: 'OUT',
          quantity: 3,
          note: 'Stok keluar',
        },
        'user-1',
      );

      expect(tx.stockMovement.create).toHaveBeenCalledWith({
        data: {
          productId: 'product-1',
          userId: 'user-1',
          type: 'OUT',
          quantity: 3,
          stockBefore: 10,
          stockAfter: 7,
          note: 'Stok keluar',
        },
        include: {
          product: true,
          user: true,
        },
      });

      expect(tx.product.update).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
        data: {
          stock: 7,
        },
      });

      expect(result).toEqual(movement);
    });

    it('harus menetapkan stok sesuai quantity untuk tipe ADJUSTMENT', async () => {
      const product = {
        id: 'product-1',
        stock: 10,
      };

      const movement = {
        id: 'movement-1',
        productId: 'product-1',
        userId: 'user-1',
        type: 'ADJUSTMENT',
        quantity: 25,
        stockBefore: 10,
        stockAfter: 25,
        note: 'Penyesuaian stok',
      };

      const tx = {
        product: {
          findUnique: vi.fn().mockResolvedValue(product),
          update: vi.fn().mockResolvedValue({
            ...product,
            stock: 25,
          }),
        },

        stockMovement: {
          create: vi.fn().mockResolvedValue(movement),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

      const result = await StockMovementService.create(
        {
          productId: 'product-1',
          type: 'ADJUSTMENT',
          quantity: 25,
          note: 'Penyesuaian stok',
        },
        'user-1',
      );

      expect(tx.stockMovement.create).toHaveBeenCalledWith({
        data: {
          productId: 'product-1',
          userId: 'user-1',
          type: 'ADJUSTMENT',
          quantity: 25,
          stockBefore: 10,
          stockAfter: 25,
          note: 'Penyesuaian stok',
        },
        include: {
          product: true,
          user: true,
        },
      });

      expect(tx.product.update).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
        data: {
          stock: 25,
        },
      });

      expect(result).toEqual(movement);
    });

    it('harus melempar AppError jika produk tidak ditemukan', async () => {
      const tx = {
        product: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

      await expect(
        StockMovementService.create(
          {
            productId: 'product-tidak-ada',
            type: 'IN',
            quantity: 10,
            note: 'Stok masuk',
          },
          'user-1',
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Produk tidak ditemukan.',
      });
    });

    it('harus melempar AppError jika stok tidak mencukupi', async () => {
      const product = {
        id: 'product-1',
        stock: 5,
      };

      const tx = {
        product: {
          findUnique: vi.fn().mockResolvedValue(product),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

      await expect(
        StockMovementService.create(
          {
            productId: 'product-1',
            type: 'OUT',
            quantity: 10,
            note: 'Stok keluar',
          },
          'user-1',
        ),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'INSUFFICIENT_STOCK',
        message: 'Stok tidak mencukupi.',
      });
    });

    it('harus memperbarui stok produk setelah movement dibuat', async () => {
      const product = {
        id: 'product-1',
        stock: 20,
      };

      const tx = {
        product: {
          findUnique: vi.fn().mockResolvedValue(product),
          update: vi.fn().mockResolvedValue({
            ...product,
            stock: 30,
          }),
        },

        stockMovement: {
          create: vi.fn().mockResolvedValue({
            id: 'movement-1',
            stockBefore: 20,
            stockAfter: 30,
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

      await StockMovementService.create(
        {
          productId: 'product-1',
          type: 'IN',
          quantity: 10,
        },
        'user-1',
      );

      expect(tx.product.update).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
        data: {
          stock: 30,
        },
      });
    });
  });
});
