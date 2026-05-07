import { describe, it, expect } from 'vitest'
import { orderStatusLabel, orderStatusColor } from '../utils/format'

describe('orderStatusLabel', () => {
  it('maps en_attente_validation → En attente', () => {
    expect(orderStatusLabel('en_attente_validation')).toBe('En attente')
  })

  it('maps acceptee → Acceptée', () => {
    expect(orderStatusLabel('acceptee')).toBe('Acceptée')
  })

  it('maps en_preparation → En préparation', () => {
    expect(orderStatusLabel('en_preparation')).toBe('En préparation')
  })

  it('maps prete → Prête', () => {
    expect(orderStatusLabel('prete')).toBe('Prête')
  })

  it('maps en_livraison → En livraison', () => {
    expect(orderStatusLabel('en_livraison')).toBe('En livraison')
  })

  it('maps livree → Livrée', () => {
    expect(orderStatusLabel('livree')).toBe('Livrée')
  })

  it('maps terminee → Terminée', () => {
    expect(orderStatusLabel('terminee')).toBe('Terminée')
  })

  it('maps refusee → Refusée', () => {
    expect(orderStatusLabel('refusee')).toBe('Refusée')
  })

  it('maps annulee → Annulée', () => {
    expect(orderStatusLabel('annulee')).toBe('Annulée')
  })

  it('maps litige → Litige', () => {
    expect(orderStatusLabel('litige')).toBe('Litige')
  })

  it('returns the raw value for an unknown status', () => {
    expect(orderStatusLabel('unknown_status')).toBe('unknown_status')
    expect(orderStatusLabel('foo_bar')).toBe('foo_bar')
  })

  it('returns null as-is (falsy passthrough)', () => {
    expect(orderStatusLabel(null)).toBe(null)
  })

  it('returns undefined as-is (falsy passthrough)', () => {
    expect(orderStatusLabel(undefined)).toBe(undefined)
  })

  it('returns empty string for empty string input', () => {
    expect(orderStatusLabel('')).toBe('')
  })
})

describe('orderStatusColor', () => {
  it('returns yellow classes for en_attente_validation', () => {
    expect(orderStatusColor('en_attente_validation')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns blue classes for acceptee', () => {
    expect(orderStatusColor('acceptee')).toBe('bg-blue-100 text-blue-800')
  })

  it('returns orange classes for en_preparation', () => {
    expect(orderStatusColor('en_preparation')).toBe('bg-orange-100 text-orange-800')
  })

  it('returns purple classes for prete', () => {
    expect(orderStatusColor('prete')).toBe('bg-purple-100 text-purple-800')
  })

  it('returns indigo classes for en_livraison', () => {
    expect(orderStatusColor('en_livraison')).toBe('bg-indigo-100 text-indigo-800')
  })

  it('returns green classes for livree', () => {
    expect(orderStatusColor('livree')).toBe('bg-green-100 text-green-800')
  })

  it('returns gray classes for terminee', () => {
    expect(orderStatusColor('terminee')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns red classes for refusee', () => {
    expect(orderStatusColor('refusee')).toBe('bg-red-100 text-red-800')
  })

  it('returns light red classes for annulee', () => {
    expect(orderStatusColor('annulee')).toBe('bg-red-50 text-red-700')
  })

  it('returns dark red classes for litige', () => {
    expect(orderStatusColor('litige')).toBe('bg-red-200 text-red-900')
  })

  it('returns default gray classes for an unknown status', () => {
    expect(orderStatusColor('unknown_status')).toBe('bg-gray-100 text-gray-800')
    expect(orderStatusColor('foo')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns default gray classes for null', () => {
    expect(orderStatusColor(null)).toBe('bg-gray-100 text-gray-800')
  })

  it('returns default gray classes for undefined', () => {
    expect(orderStatusColor(undefined)).toBe('bg-gray-100 text-gray-800')
  })

  it('returns default gray classes for empty string', () => {
    expect(orderStatusColor('')).toBe('bg-gray-100 text-gray-800')
  })

  it('always returns a string containing bg- and text- for known statuses', () => {
    const knownStatuses = [
      'en_attente_validation', 'acceptee', 'en_preparation',
      'prete', 'en_livraison', 'livree', 'terminee',
      'refusee', 'annulee', 'litige',
    ]
    knownStatuses.forEach(statut => {
      const result = orderStatusColor(statut)
      expect(result).toMatch(/bg-/)
      expect(result).toMatch(/text-/)
    })
  })
})
