import { z } from 'zod'

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, 'Must be a hex color like #0f766e')

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(500).optional(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  primaryColor: hexColor.nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'examiner', 'student']),
})
