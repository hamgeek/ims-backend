import { z } from 'zod';

const categoryNameSchema = z
  .string()
  .trim()
  .min(2, 'Nama kategori minimal 2 karakter')
  .max(100, 'Nama kategori maksimal 100 karakter');

const categoryDescriptionSchema = z
  .string()
  .trim()
  .max(500, 'Deskripsi maksimal 500 karakter')
  .nullable()
  .optional();

export const createCategorySchema = z.object({
  name: categoryNameSchema,

  description: categoryDescriptionSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    name: categoryNameSchema.optional(),

    description: categoryDescriptionSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryIdSchema = z.object({
  id: z.string().min(1, 'ID kategori wajib diisi'),
});

export type CategoryIdInput = z.infer<typeof categoryIdSchema>;
