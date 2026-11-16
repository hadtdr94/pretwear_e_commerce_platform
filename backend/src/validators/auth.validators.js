import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  firstName: z.string().trim().optional().or(z.literal('')).transform((v) => v || undefined),
  lastName: z.string().trim().optional().or(z.literal('')).transform((v) => v || undefined),
  phone: z.string().trim().optional().or(z.literal('')).transform((v) => v || undefined),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
});
