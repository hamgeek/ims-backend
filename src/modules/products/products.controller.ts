import { Context } from 'hono';

import { AppError } from '../../exceptions/app-error';
import { UserService } from '../users/users.service';
import { createProductSchema, productIdSchema, updateProductSchema } from './products.contract';
import { ProductService } from './products.service';

export class ProductController {
  findAll = async (c: Context) => {
    const products = await ProductService.findAll();

    return c.json({
      success: true,
      data: products,
    });
  };

  findById = async (c: Context) => {
    const { id } = productIdSchema.parse(c.req.param());

    const product = await ProductService.findById(id);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Produk tidak ditemukan.');
    }

    return c.json({
      success: true,
      data: product,
    });
  };

  create = async (c: Context) => {
    const userSession = await UserService.checkAuth(c);

    if (!userSession) {
      throw new AppError(401, 'UNAUTHORIZED', 'Autentikasi Diperlukan.');
    }

    const body = await c.req.json();

    const dto = createProductSchema.parse(body);

    const product = await ProductService.create(userSession.user.id, dto);

    return c.json(
      {
        success: true,
        data: product,
      },
      201,
    );
  };

  update = async (c: Context) => {
    const { id } = productIdSchema.parse(c.req.param());

    const body = await c.req.json();

    const dto = updateProductSchema.parse(body);

    const existingProduct = await ProductService.findById(id);

    if (!existingProduct) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Produk tidak ditemukan.');
    }

    const product = await ProductService.update(id, dto);

    return c.json({
      success: true,
      data: product,
    });
  };

  delete = async (c: Context) => {
    const { id } = productIdSchema.parse(c.req.param());

    const existingProduct = await ProductService.findById(id);

    if (!existingProduct) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Produk tidak ditemukan.');
    }

    await ProductService.delete(id);

    return c.json({
      success: true,
      message: 'Produk berhasil dihapus.',
    });
  };
}
