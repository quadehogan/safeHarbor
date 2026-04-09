import { useState } from 'react'

// Validation rule: field name -> error message (empty string = valid)
export type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], form: T) => string
}

// Hook return type
export interface FormValidation<T> {
  errors: Partial<Record<keyof T, string>>
  validate: (form: T) => boolean
  fieldError: (field: keyof T) => string | undefined
  clearError: (field: keyof T) => void
  clearAll: () => void
}

// Reusable form validation hook
export function useFormValidation<T>(rules: ValidationRules<T>): FormValidation<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  function validate(form: T): boolean {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let valid = true

    for (const [field, ruleFn] of Object.entries(rules) as [keyof T, (v: unknown, f: T) => string][]) {
      const msg = ruleFn(form[field], form)
      if (msg) {
        newErrors[field] = msg
        valid = false
      }
    }

    setErrors(newErrors)
    return valid
  }

  function fieldError(field: keyof T): string | undefined {
    return errors[field]
  }

  function clearError(field: keyof T) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function clearAll() {
    setErrors({})
  }

  return { errors, validate, fieldError, clearError, clearAll }
}

// ---- Common validation helpers ----

export function required(label: string) {
  return (value: unknown) => {
    if (value === null || value === undefined || value === '') return `${label} is required`
    return ''
  }
}

export function requiredSelect(label: string) {
  return (value: unknown) => {
    if (!value || value === '') return `Please select a ${label.toLowerCase()}`
    return ''
  }
}

export function validEmail(value: unknown) {
  if (!value || value === '') return 'Email is required'
  if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
  return ''
}

export function positiveNumber(label: string) {
  return (value: unknown) => {
    if (value === null || value === undefined || value === '') return ''
    if (typeof value === 'number' && value < 0) return `${label} must be a positive number`
    return ''
  }
}

export function minLength(label: string, min: number) {
  return (value: unknown) => {
    if (!value || value === '') return ''
    if (typeof value === 'string' && value.length < min) return `${label} must be at least ${min} characters`
    return ''
  }
}

export function notFutureDate(label: string) {
  return (value: unknown) => {
    if (!value || value === '') return ''
    if (typeof value === 'string' && new Date(value) > new Date()) return `${label} cannot be in the future`
    return ''
  }
}
