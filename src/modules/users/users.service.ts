import { Context } from 'hono';

import { auth } from '../../lib/auth';
import prisma from '../../lib/db';
import { CreateUserInput, LoginInput, UpdateProfileInput } from './users.contract';

export abstract class UserService {
  static async create(c: Context, data: CreateUserInput) {
    return auth.api.signUpEmail({
      body: data,
      headers: c.req.raw.headers,
      asResponse: true,
    });
  }

  static async signIn(c: Context, data: LoginInput) {
    return auth.api.signInEmail({
      body: data,
      headers: c.req.raw.headers,
      asResponse: true,
    });
  }

  static async checkAuth(c: Context) {
    return auth.api.getSession({
      headers: c.req.raw.headers,
    });
  }

  static async updateProfile(idUser: string, data: UpdateProfileInput) {
    return prisma.user.update({
      data,
      where: {
        id: idUser,
      },
    });
  }
}
