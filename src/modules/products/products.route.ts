import { Hono } from 'hono';

import { authMiddleware } from '../../middleware';
import { ProductController } from './products.controller';

const products = new Hono();

const productController = new ProductController();

products.use('*', authMiddleware);

products.get('/', productController.findAll);

products.get('/:id', productController.findById);

products.post('/', productController.create);

products.patch('/:id', productController.update);

products.delete('/:id', productController.delete);

export default products;
