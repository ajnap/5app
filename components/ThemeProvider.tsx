'use client'

/**
 * Theme Provider for Dark Mode
 * Wraps the app with next-themes provider for system-aware dark mode
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
