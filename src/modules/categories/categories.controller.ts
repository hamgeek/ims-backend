import { Context } from 'hono';

import { AppError } from '../../exceptions/app-error';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.contract';
import { CategoryService } from './categories.service';

export class CategoryController {
  findAll = async (c: Context) => {
    const categories = await CategoryService.findAll();

    return c.json({
      success: true,
      data: categories,
    });
  };

  findById = async (c: Context) => {
    const { id } = categoryIdSchema.parse(c.req.param());

    const category = await CategoryService.findById(id);

    if (!category) {
      throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan.');
    }

    return c.json({
      success: true,
      data: category,
    });
  };

  create = async (c: Context) => {
    const body = await c.req.json();

    const dto = createCategorySchema.parse(body);

    const category = await CategoryService.create(dto);

    return c.json(
      {
        success: true,
        data: category,
      },
      201,
    );
  };

  update = async (c: Context) => {
    const { id } = categoryIdSchema.parse(c.req.param());

    const body = await c.req.json();

    const dto = updateCategorySchema.parse(body);

    const existingCategory = await CategoryService.findById(id);

    if (!existingCategory) {
      throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan.');
    }

    const category = await CategoryService.update(id, dto);

    return c.json({
      success: true,
      data: category,
    });
  };

  delete = async (c: Context) => {
    const { id } = categoryIdSchema.parse(c.req.param());

    const existingCategory = await CategoryService.findById(id);

    if (!existingCategory) {
      throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Kategori tidak ditemukan.');
    }

    await CategoryService.delete(id);

    return c.json({
      success: true,
      message: 'Kategori berhasil dihapus.',
    });
  };
}
