import { z } from 'zod';

// ══════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ══════════════════════════════════════════════════════════

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email boş olamaz')
    .email('Geçerli bir email adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre boş olamaz'),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ad boş olamaz')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z
    .string()
    .min(1, 'Soyad boş olamaz')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  email: z
    .string()
    .min(1, 'Email boş olamaz')
    .email('Geçerli bir email adresi giriniz')
    .refine(
      (val) =>
        val.endsWith('@std.yeditepe.edu.tr') ||
        val.endsWith('@yeditepe.edu.tr'),
      'Sadece @std.yeditepe.edu.tr veya @yeditepe.edu.tr uzantılı email kullanılabilir'
    ),
  password: z
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  studentNumber: z
    .string()
    .min(1, 'Öğrenci numarası boş olamaz'),
  phoneNumber: z
    .string()
    .optional(),
  department: z
    .string()
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email boş olamaz')
    .email('Geçerli bir email adresi giriniz'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token boş olamaz'),
  newPassword: z
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Mevcut şifre boş olamaz'),
  newPassword: z
    .string()
    .min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
});

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Ad soyad boş olamaz')
    .max(100, 'Ad soyad en fazla 100 karakter olabilir')
    .optional(),
  phoneNumber: z
    .string()
    .optional(),
  department: z
    .string()
    .optional(),
});

// ══════════════════════════════════════════════════════════
// LOST REPORT SCHEMAS
// ══════════════════════════════════════════════════════════

export const lostReportSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık boş olamaz')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  category: z
    .string()
    .min(1, 'Kategori seçiniz'),
  lostLocation: z
    .string()
    .min(1, 'Konum boş olamaz'),
  lostDate: z
    .string()
    .min(1, 'Tarih seçiniz'),
  description: z
    .string()
    .min(1, 'Açıklama boş olamaz')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  imageUrl: z.string().nullable().optional(),
});

// ══════════════════════════════════════════════════════════
// CLAIM REQUEST SCHEMAS
// ══════════════════════════════════════════════════════════

export const claimRequestSchema = z.object({
  itemId: z
    .number()
    .positive('Geçersiz eşya seçimi'),
  description: z
    .string()
    .min(1, 'Açıklama boş olamaz')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  distinguishingFeature: z
    .string()
    .min(1, 'Ayırt edici özellik boş olamaz'),
  additionalNote: z
    .string()
    .optional(),
});

// ══════════════════════════════════════════════════════════
// FOUND ITEM SCHEMAS (Admin)
// ══════════════════════════════════════════════════════════

export const foundItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık boş olamaz')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  category: z
    .string()
    .min(1, 'Kategori seçiniz'),
  location: z
    .string()
    .min(1, 'Konum boş olamaz'),
  foundDate: z
    .string()
    .min(1, 'Tarih seçiniz'),
  description: z
    .string()
    .min(1, 'Açıklama boş olamaz')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  storageLocation: z
    .string()
    .min(1, 'Saklama yeri boş olamaz'),
  imageUrl: z.string().nullable().optional(),
});

// ══════════════════════════════════════════════════════════
// API RESPONSE SCHEMA (generic)
// ══════════════════════════════════════════════════════════

export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().nullable(),
  timestamp: z.string().optional(),
});

// ══════════════════════════════════════════════════════════
// HELPER — Zod hatalarını kullanıcı dostu mesaja çevir
// ══════════════════════════════════════════════════════════

export function getValidationError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message || 'Geçersiz veri';
}

/**
 * Veriyi schema'ya göre doğrular.
 * Geçerliyse veriyi döner, geçersizse hata fırlatır.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(getValidationError(result.error));
  }
  return result.data;
}
