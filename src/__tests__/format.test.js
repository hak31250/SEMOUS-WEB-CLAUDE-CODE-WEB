import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatDate,
  formatDateShort,
  orderStatusLabel,
  orderStatusColor,
  paymentStatusLabel,
  generateOrderNumber,
} from '../utils/format'

describe('formatPrice', () => {
  it('formats integer amounts', () => {
    const result = formatPrice(10)
    expect(result).toContain('10')
    expect(result).toContain('€')
  })

  it('formats decimal amounts', () => {
    const result = formatPrice(9.9)
    expect(result).toContain('9')
    expect(result).toContain('€')
  })

  it('formats zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2025-05-01T19:00:00.000Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year', () => {
    const result = formatDate('2025-05-01T19:00:00.000Z')
    expect(result).toContain('2025')
  })
})

describe('formatDateShort', () => {
  it('returns a date without time', () => {
    const result = formatDateShort('2025-05-01T19:00:00.000Z')
    expect(result).toContain('2025')
    expect(result).not.toContain(':')
  })
})

describe('orderStatusLabel', () => {
  const cases = [
    ['en_attente_validation', 'En attente'],
    ['acceptee', 'Acceptée'],
    ['en_preparation', 'En préparation'],
    ['prete', 'Prête'],
    ['en_livraison', 'En livraison'],
    ['livree', 'Livrée'],
    ['terminee', 'Terminée'],
    ['refusee', 'Refusée'],
    ['annulee', 'Annulée'],
    ['litige', 'Litige'],
  ]
  cases.forEach(([statut, expected]) => {
    it(`maps ${statut} → ${expected}`, () => {
      expect(orderStatusLabel(statut)).toBe(expected)
    })
  })

  it('returns unknown statuts as-is', () => {
    expect(orderStatusLabel('unknown_status')).toBe('unknown_status')
  })
})

describe('orderStatusColor', () => {
  it('returns a CSS class string for known statuts', () => {
    const result = orderStatusColor('acceptee')
    expect(result).toContain('bg-')
    expect(result).toContain('text-')
  })

  it('returns default class for unknown statuts', () => {
    const result = orderStatusColor('unknown')
    expect(result).toBe('bg-gray-100 text-gray-800')
  })
})

describe('paymentStatusLabel', () => {
  it('maps capture to Capturé', () => {
    expect(paymentStatusLabel('capture')).toBe('Capturé')
  })

  it('returns unknown keys as-is', () => {
    expect(paymentStatusLabel('foo')).toBe('foo')
  })
})

describe('generateOrderNumber', () => {
  it('starts with SEM-', () => {
    expect(generateOrderNumber()).toMatch(/^SEM-/)
  })

  it('contains a date segment', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    expect(generateOrderNumber()).toContain(today)
  })

  it('ends with a 4-digit number', () => {
    expect(generateOrderNumber()).toMatch(/-\d{4}$/)
  })

  it('generates unique numbers across calls', () => {
    const numbers = new Set(Array.from({ length: 20 }, () => generateOrderNumber()))
    expect(numbers.size).toBeGreaterThan(1)
  })
})
