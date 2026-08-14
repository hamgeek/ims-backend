import { Prisma } from '../generated/prisma/client';

type PrismaErrorResult = {
  statusCode: 409 | 404 | 500;
  code: string;
  message: string;
};

export function handlePrismaError(error: unknown): PrismaErrorResult | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  switch (error.code) {
    case 'P2002':
      return {
        statusCode: 409,
        code: 'DUPLICATE_RESOURCE',
        message: 'Data sudah digunakan',
      };

    case 'P2025':
      return {
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Data tidak ditemukan',
      };

    case 'P2003':
      return {
        statusCode: 409,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Data terkait masih digunakan',
      };

    case 'P2014':
      return {
        statusCode: 409,
        code: 'RELATION_VIOLATION',
        message: 'Operasi melanggar relasi data',
      };

    default:
      return {
        statusCode: 500,
        code: 'DATABASE_ERROR',
        message: 'Terjadi kesalahan pada database',
      };
  }
}
