import { Context } from 'hono';

import { AppError } from '../../exceptions/app-error';
import { UserService } from '../users/users.service';
import {
  createStockMovementSchema,
  productStockMovementParamSchema,
  stockMovementIdSchema,
} from './stock-movements.contract';
import { StockMovementService } from './stock-movements.service';

export class StockMovementController {
  findAll = async (c: Context) => {
    const movements = await StockMovementService.findAll();

    return c.json({
      success: true,
      data: movements,
    });
  };

  findById = async (c: Context) => {
    const { id } = stockMovementIdSchema.parse(c.req.param());

    const movement = await StockMovementService.findById(id);

    if (!movement) {
      throw new AppError(404, 'STOCK_MOVEMENT_NOT_FOUND', 'Stock movement tidak ditemukan.');
    }

    return c.json({
      success: true,
      data: movement,
    });
  };

  findByProduct = async (c: Context) => {
    const { productId } = productStockMovementParamSchema.parse(c.req.param());

    const movements = await StockMovementService.findByProduct(productId);

    return c.json({
      success: true,
      data: movements,
    });
  };

  create = async (c: Context) => {
    const userSession = await UserService.checkAuth(c);

    if (!userSession) {
      throw new AppError(401, 'UNAUTHORIZED', 'Autentikasi Diperlukan.');
    }

    const body = await c.req.json();

    const dto = createStockMovementSchema.parse(body);

    const movement = await StockMovementService.create(dto, userSession.user.id);

    return c.json(
      {
        success: true,
        data: movement,
      },
      201,
    );
  };
}
