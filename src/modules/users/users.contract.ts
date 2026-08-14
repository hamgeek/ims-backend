import { z } from 'zod';

const userNameSchema = z
  .string()
  .trim()
  .min(2, 'Nama minimal 2 karakter')
  .max(100, 'Nama maksimal 100 karakter');

const emailSchema = z.email('Format email tidak valid').max(255, 'Email maksimal 255 karakter');

const passwordSchema = z
  .string()
  .min(8, 'Kata sandi minimal 8 karakter')
  .max(100, 'Kata sandi maksimal 100 karakter');

// const imageSchema = z.url('URL gambar tidak valid').nullable().optional();

export const createUserSchema = z.object({
  name: userNameSchema,

  email: emailSchema,

  password: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: userNameSchema.optional(),

    email: emailSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi',
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateProfileSchema = z.object({
  name: userNameSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changeEmailSchema = z.object({
  email: emailSchema,
});

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),

    newPassword: passwordSchema,

    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Kata sandi baru harus berbeda dari kata sandi saat ini',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, 'Kata sandi wajib diisi'),

  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token verifikasi wajib diisi'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token reset wajib diisi'),

    password: passwordSchema,

    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
