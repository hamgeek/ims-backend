import { Hono } from 'hono';

import { authMiddleware } from '../../middleware';
import { StockMovementController } from './stock-movements.controller';

const stockMovements = new Hono();

const stockMovementController = new StockMovementController();

stockMovements.use('*', authMiddleware);

stockMovements.get('/', stockMovementController.findAll);

stockMovements.get('/product/:productId', stockMovementController.findByProduct);

stockMovements.get('/:id', stockMovementController.findById);

stockMovements.post('/', stockMovementController.create);

export default stockMovements;
