/**
 * Input validation utilities for API routes
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate phone number (basic E.164 format)
 */
export function isValidPhone(phone: string): boolean {
  // Allow various formats: +1234567890, 123-456-7890, (123) 456-7890, etc.
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): ValidationResult {
  const errors: string[] = []

  for (const field of fields) {
    const value = data[field]
    if (value === undefined || value === null || value === "") {
      errors.push(`${field} is required`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate student data
 */
export function validateStudentData(data: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}): ValidationResult {
  const errors: string[] = []

  // Required fields
  if (!data.firstName?.trim()) {
    errors.push("First name is required")
  }
  if (!data.lastName?.trim()) {
    errors.push("Last name is required")
  }

  // Email validation (optional but must be valid if provided)
  if (data.email && !isValidEmail(data.email)) {
    errors.push("Invalid email format")
  }

  // Phone validation (optional but must be valid if provided)
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push("Invalid phone number format")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate payment data
 */
export function validatePaymentData(data: {
  studentId?: string
  amount?: number
  dueDate?: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.studentId) {
    errors.push("Student ID is required")
  }

  if (data.amount === undefined || data.amount === null) {
    errors.push("Amount is required")
  } else if (typeof data.amount !== "number" || data.amount <= 0) {
    errors.push("Amount must be a positive number")
  }

  if (data.dueDate && !isValidDate(data.dueDate)) {
    errors.push("Invalid due date format")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate registration data
 */
export function validateRegistrationData(data: {
  name?: string
  email?: string
  password?: string
  organizationName?: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.name?.trim()) {
    errors.push("Name is required")
  }

  if (!data.email) {
    errors.push("Email is required")
  } else if (!isValidEmail(data.email)) {
    errors.push("Invalid email format")
  }

  if (!data.password) {
    errors.push("Password is required")
  } else {
    const passwordResult = validatePassword(data.password)
    errors.push(...passwordResult.errors)
  }

  if (!data.organizationName?.trim()) {
    errors.push("Organization name is required")
  } else if (data.organizationName.length < 2) {
    errors.push("Organization name must be at least 2 characters")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate enum value
 */
export function isValidEnumValue<T extends Record<string, string>>(
  value: string,
  enumObject: T
): boolean {
  return Object.values(enumObject).includes(value)
}

/**
 * Sanitize string input (trim whitespace, prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}
