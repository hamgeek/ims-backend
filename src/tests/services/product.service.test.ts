import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../lib/db', () => ({
  default: prismaMock,
}));

import { ProductService } from '../../modules/products/products.service';

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('harus mengembalikan semua produk berdasarkan tanggal terbaru', async () => {
      const products = [
        {
          id: 'product-1',
          categoryId: 'category-1',
          sku: 'SKU-001',
          name: 'Keyboard',
          description: 'Mechanical Keyboard',
          price: 500000,
          stock: 10,
          minStock: 2,
          unit: 'pcs',
          imageUrl: null,
          status: 'ACTIVE',
          createdAt: new Date('2026-08-14'),
          updatedAt: new Date('2026-08-14'),
          category: {
            id: 'category-1',
            name: 'Elektronik',
          },
        },
      ];

      prismaMock.product.findMany.mockResolvedValue(products);

      const result = await ProductService.findAll();

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(products);
    });
  });

  describe('findById', () => {
    it('harus mengembalikan produk berdasarkan ID', async () => {
      const product = {
        id: 'product-1',
        categoryId: 'category-1',
        sku: 'SKU-001',
        name: 'Keyboard',
        description: 'Mechanical Keyboard',
        price: 500000,
        stock: 10,
        minStock: 2,
        unit: 'pcs',
        imageUrl: null,
        status: 'ACTIVE',
        category: {
          id: 'category-1',
          name: 'Elektronik',
        },
      };

      prismaMock.product.findUnique.mockResolvedValue(product);

      const result = await ProductService.findById('product-1');

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
        include: {
          category: true,
        },
      });

      expect(result).toEqual(product);
    });

    it('harus mengembalikan null jika produk tidak ditemukan', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      const result = await ProductService.findById('product-tidak-ada');

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'product-tidak-ada',
        },
        include: {
          category: true,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('harus membuat produk baru dengan createdBy', async () => {
      const createdBy = 'user-1';

      const data = {
        categoryId: 'category-1',
        sku: 'SKU-001',
        name: 'Keyboard',
        description: 'Mechanical Keyboard',
        price: 500000,
        stock: 10,
        minStock: 2,
        unit: 'pcs',
        imageUrl: null,
        status: 'ACTIVE',
      };

      const product = {
        id: 'product-1',
        createdBy,
        ...data,
        category: {
          id: 'category-1',
          name: 'Elektronik',
        },
      };

      prismaMock.product.create.mockResolvedValue(product);

      const result = await ProductService.create(createdBy, data);

      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          createdBy,
          ...data,
        },
        include: {
          category: true,
        },
      });

      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('harus memperbarui produk berdasarkan ID', async () => {
      const data = {
        name: 'Keyboard Mechanical',
        price: 750000,
      };

      const product = {
        id: 'product-1',
        categoryId: 'category-1',
        sku: 'SKU-001',
        name: 'Keyboard Mechanical',
        description: 'Mechanical Keyboard',
        price: 750000,
        stock: 10,
        minStock: 2,
        unit: 'pcs',
        imageUrl: null,
        status: 'ACTIVE',
        category: {
          id: 'category-1',
          name: 'Elektronik',
        },
      };

      prismaMock.product.update.mockResolvedValue(product);

      const result = await ProductService.update('product-1', data);

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
        data,
        include: {
          category: true,
        },
      });

      expect(result).toEqual(product);
    });
  });

  describe('delete', () => {
    it('harus menghapus produk berdasarkan ID', async () => {
      const product = {
        id: 'product-1',
        sku: 'SKU-001',
        name: 'Keyboard',
      };

      prismaMock.product.delete.mockResolvedValue(product);

      const result = await ProductService.delete('product-1');

      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: {
          id: 'product-1',
        },
      });

      expect(result).toEqual(product);
    });
  });
});
