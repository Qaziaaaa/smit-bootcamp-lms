// Utility: cn() — merges Tailwind CSS classes safely.
// Combines clsx (conditional classes) + tailwind-merge (deduplicates conflicting classes).
// Example: cn("px-4", isActive && "bg-blue-500", "px-8") → "bg-blue-500 px-8" (px-4 is removed)
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
