/**
 * Input Validation Schemas
 * Using Zod for runtime type checking and validation
 */

import { z } from 'zod'
import { SUBSCRIPTION_TIER } from './constants'

// Authentication schemas
export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters')

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// Stripe checkout schema
export const checkoutSchema = z.object({
  tier: z.enum([SUBSCRIPTION_TIER.MONTHLY as 'monthly', SUBSCRIPTION_TIER.YEARLY as 'yearly'], {
    message: 'Invalid subscription tier. Must be "monthly" or "yearly"',
  }),
})

// Helper function to validate and parse data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: z.ZodError
} {
  try {
    const parsedData = schema.parse(data)
    return { success: true, data: parsedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

// Format Zod errors for API responses
export function formatZodError(error: z.ZodError): {
  message: string
  errors: Array<{ field: string; message: string }>
} {
  return {
    message: 'Validation failed',
    errors: error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  }
}
