import { Hono } from 'hono';

import { authMiddleware } from '../../middleware';
import { CategoryController } from './categories.controller';

const categories = new Hono();

const categoryController = new CategoryController();

categories.use('*', authMiddleware);

categories.get('/', categoryController.findAll);

categories.get('/:id', categoryController.findById);

categories.post('/', categoryController.create);

categories.patch('/:id', categoryController.update);

categories.delete('/:id', categoryController.delete);

export default categories;
