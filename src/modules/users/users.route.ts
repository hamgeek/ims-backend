import { Hono } from 'hono';

import { authMiddleware } from '../../middleware';
import { UserController } from './users.controller';

const users = new Hono();

const userController = new UserController();

users.post('/create', authMiddleware, userController.create);

users.post('/sign-in', userController.signIn);

users.patch('/update-profile', authMiddleware, userController.updateProfile);

export default users;
