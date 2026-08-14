import { z } from 'zod';

const productNameSchema = z
  .string()
  .trim()
  .min(2, 'Nama produk minimal 2 karakter')
  .max(150, 'Nama produk maksimal 150 karakter');

const productSkuSchema = z
  .string()
  .trim()
  .min(1, 'SKU wajib diisi')
  .max(100, 'SKU maksimal 100 karakter');

const productDescriptionSchema = z
  .string()
  .trim()
  .max(500, 'Deskripsi maksimal 500 karakter')
  .nullable()
  .optional();

const productPriceSchema = z.number().nonnegative('Harga tidak boleh kurang dari 0');

const productStockSchema = z
  .number()
  .int('Stok harus berupa bilangan bulat')
  .nonnegative('Stok tidak boleh kurang dari 0');

const productMinStockSchema = z
  .number()
  .int('Min Stok harus berupa bilangan bulat')
  .nonnegative('Min Stok tidak boleh kurang dari 0');

const categoryIdSchema = z.string().min(1, 'Kategori wajib dipilih');

export const createProductSchema = z.object({
  name: productNameSchema,

  sku: productSkuSchema,

  description: productDescriptionSchema,

  price: productPriceSchema,

  stock: productStockSchema,

  minStock: productMinStockSchema,

  categoryId: categoryIdSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    name: productNameSchema.optional(),

    sku: productSkuSchema.optional(),

    description: productDescriptionSchema,

    price: productPriceSchema.optional(),

    stock: productStockSchema.optional(),

    minStock: productMinStockSchema.optional(),

    categoryId: categoryIdSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productIdSchema = z.object({
  id: z.string().min(1, 'ID produk wajib diisi'),
});

export type ProductIdInput = z.infer<typeof productIdSchema>;
