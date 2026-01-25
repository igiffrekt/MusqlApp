import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-safe slug from a name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (Hungarian accents)
    .replace(/[^a-z0-9]+/g, "-")     // Replace non-alphanumeric with dash
    .replace(/^-|-$/g, "")           // Remove leading/trailing dashes
    .substring(0, 50)                // Limit length
}