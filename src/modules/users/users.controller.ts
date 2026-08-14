import { Context } from 'hono';

import { createUserSchema, loginSchema } from './users.contract';
import { UserService } from './users.service';

export class UserController {
  create = async (c: Context) => {
    const body = await c.req.json();
    const dto = createUserSchema.parse(body);

    const user = await UserService.create(c, dto);

    return c.json(user, 200);
  };

  signIn = async (c: Context) => {
    const body = await c.req.json();
    const dto = loginSchema.parse(body);

    const signIn = await UserService.signIn(c, dto);

    return c.json(signIn, 200);
  };

  updateProfile = async (c: Context) => {
    const userSession = c.get('user');

    const body = await c.req.json();
    const dto = createUserSchema.parse(body);

    const user = await UserService.updateProfile(userSession.id, dto);

    return c.json({
      success: true,
      data: user,
    });
  };
}
