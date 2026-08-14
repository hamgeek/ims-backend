import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryService } from '../../modules/categories/categories.service';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    category: {
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

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('harus mengembalikan semua kategori berdasarkan tanggal terbaru', async () => {
      const categories = [
        {
          id: 'category-1',
          name: 'Elektronik',
          createdAt: new Date('2026-08-14'),
          updatedAt: new Date('2026-08-14'),
        },
        {
          id: 'category-2',
          name: 'Makanan',
          createdAt: new Date('2026-08-13'),
          updatedAt: new Date('2026-08-13'),
        },
      ];

      prismaMock.category.findMany.mockResolvedValue(categories);

      const result = await CategoryService.findAll();

      expect(prismaMock.category.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(categories);
    });
  });

  describe('findById', () => {
    it('harus mengembalikan kategori berdasarkan ID', async () => {
      const category = {
        id: 'category-1',
        name: 'Elektronik',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.category.findUnique.mockResolvedValue(category);

      const result = await CategoryService.findById('category-1');

      expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'category-1',
        },
      });

      expect(result).toEqual(category);
    });

    it('harus mengembalikan null jika kategori tidak ditemukan', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      const result = await CategoryService.findById('category-tidak-ada');

      expect(result).toBeNull();

      expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'category-tidak-ada',
        },
      });
    });
  });

  describe('create', () => {
    it('harus membuat kategori baru', async () => {
      const data = {
        name: 'Elektronik',
      };

      const category = {
        id: 'category-1',
        name: 'Elektronik',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.category.create.mockResolvedValue(category);

      const result = await CategoryService.create(data);

      expect(prismaMock.category.create).toHaveBeenCalledWith({
        data,
      });

      expect(result).toEqual(category);
    });
  });

  describe('update', () => {
    it('harus memperbarui kategori', async () => {
      const data = {
        name: 'Elektronik Baru',
      };

      const category = {
        id: 'category-1',
        name: 'Elektronik Baru',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.category.update.mockResolvedValue(category);

      const result = await CategoryService.update('category-1', data);

      expect(prismaMock.category.update).toHaveBeenCalledWith({
        where: {
          id: 'category-1',
        },
        data,
      });

      expect(result).toEqual(category);
    });
  });

  describe('delete', () => {
    it('harus menghapus kategori berdasarkan ID', async () => {
      const category = {
        id: 'category-1',
        name: 'Elektronik',
      };

      prismaMock.category.delete.mockResolvedValue(category);

      const result = await CategoryService.delete('category-1');

      expect(prismaMock.category.delete).toHaveBeenCalledWith({
        where: {
          id: 'category-1',
        },
      });

      expect(result).toEqual(category);
    });
  });
});
