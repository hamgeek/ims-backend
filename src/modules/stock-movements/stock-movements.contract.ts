import { z } from 'zod';

const productIdSchema = z.string().min(1, 'Produk wajib dipilih');

const stockMovementTypeSchema = z.enum(['IN', 'OUT', 'ADJUSTMENT']);

const quantitySchema = z
  .number()
  .int('Jumlah stok harus berupa bilangan bulat')
  .positive('Jumlah stok harus lebih dari 0');

const noteSchema = z
  .string()
  .trim()
  .max(500, 'Catatan maksimal 500 karakter')
  .nullable()
  .optional();

export const createStockMovementSchema = z.object({
  productId: productIdSchema,

  type: stockMovementTypeSchema,

  quantity: quantitySchema,

  note: noteSchema,
});

export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;

export const stockMovementIdSchema = z.object({
  id: z.string().min(1, 'ID stock movement wajib diisi'),
});

export type StockMovementIdInput = z.infer<typeof stockMovementIdSchema>;

export const productStockMovementParamSchema = z.object({
  productId: productIdSchema,
});

export type ProductStockMovementParamInput = z.infer<typeof productStockMovementParamSchema>;
