import { describe, it, expect } from 'vitest'
import { computeCartTotals, calcDeliveryFee, LIVRAISON_MINIMUM, LIVRAISON_OFFERTE_A } from '../store/cartStore'

const makeItem = (prix_ttc, quantity = 1, options = {}) => ({
  key: `${prix_ttc}-${JSON.stringify(options)}`,
  product: { id: '1', prix_ttc },
  quantity,
  options,
})

describe('calcDeliveryFee', () => {
  it('returns 3 EUR for 0-3 km below free threshold', () => {
    expect(calcDeliveryFee(1, 10)).toBe(3)
    expect(calcDeliveryFee(2.9, 10)).toBe(3)
  })

  it('returns 4 EUR for 3-5 km', () => {
    expect(calcDeliveryFee(3, 10)).toBe(4)
    expect(calcDeliveryFee(4.9, 10)).toBe(4)
  })

  it('returns 5 EUR for 5-7 km', () => {
    expect(calcDeliveryFee(5, 10)).toBe(5)
    expect(calcDeliveryFee(6.9, 10)).toBe(5)
  })

  it('returns null beyond 7 km (blocked zone)', () => {
    expect(calcDeliveryFee(7, 10)).toBeNull()
    expect(calcDeliveryFee(10, 10)).toBeNull()
  })

  it('returns 0 when subtotal >= LIVRAISON_OFFERTE_A', () => {
    expect(calcDeliveryFee(2, LIVRAISON_OFFERTE_A)).toBe(0)
    expect(calcDeliveryFee(2, LIVRAISON_OFFERTE_A + 5)).toBe(0)
  })
})

describe('computeCartTotals', () => {
  it('computes sousTotal from items', () => {
    const items = [makeItem(10, 2), makeItem(5, 1)]
    const result = computeCartTotals(items, 'retrait', null, 0)
    expect(result.sousTotal).toBe(25)
  })

  it('includes option supplements in sousTotal', () => {
    const item = {
      key: 'a',
      product: { id: '1', prix_ttc: 10 },
      quantity: 1,
      options: { taille: { prix_supplement: 2 } },
    }
    const result = computeCartTotals([item], 'retrait', null, 0)
    expect(result.sousTotal).toBe(12)
  })

  it('adds delivery fee for livraison mode', () => {
    const items = [makeItem(10, 1)]
    const result = computeCartTotals(items, 'livraison', 1, 0)
    expect(result.fraisLivraison).toBe(3)
    expect(result.totalFinal).toBe(13)
  })

  it('no delivery fee for retrait mode', () => {
    const items = [makeItem(10, 1)]
    const result = computeCartTotals(items, 'retrait', 1, 0)
    expect(result.fraisLivraison).toBe(0)
    expect(result.totalFinal).toBe(10)
  })

  it('free delivery when sousTotal >= LIVRAISON_OFFERTE_A', () => {
    const items = [makeItem(LIVRAISON_OFFERTE_A, 1)]
    const result = computeCartTotals(items, 'livraison', 2, 0)
    expect(result.fraisLivraison).toBe(0)
  })

  it('applies reduction to totalFinal', () => {
    const items = [makeItem(20, 1)]
    const result = computeCartTotals(items, 'retrait', null, 5)
    expect(result.totalFinal).toBe(15)
    expect(result.reduction).toBe(5)
  })

  it('totalFinal never goes below 0', () => {
    const items = [makeItem(5, 1)]
    const result = computeCartTotals(items, 'retrait', null, 100)
    expect(result.totalFinal).toBe(0)
  })

  it('returns reduction in result object', () => {
    const result = computeCartTotals([makeItem(10)], 'retrait', null, 3)
    expect(result.reduction).toBe(3)
  })

  it('isDeliveryEligible is false below LIVRAISON_MINIMUM for livraison', () => {
    const items = [makeItem(LIVRAISON_MINIMUM - 1, 1)]
    const result = computeCartTotals(items, 'livraison', 1, 0)
    expect(result.isDeliveryEligible).toBe(false)
  })

  it('isDeliveryEligible is true for retrait regardless of amount', () => {
    const items = [makeItem(1, 1)]
    const result = computeCartTotals(items, 'retrait', 1, 0)
    expect(result.isDeliveryEligible).toBe(true)
  })

  it('deliveryZoneBlocked is true when distanceKm >= 7 in livraison mode', () => {
    const items = [makeItem(20, 1)]
    const result = computeCartTotals(items, 'livraison', 8, 0)
    expect(result.deliveryZoneBlocked).toBe(true)
  })

  it('deliveryZoneBlocked is false when distanceKm < 7', () => {
    const items = [makeItem(20, 1)]
    const result = computeCartTotals(items, 'livraison', 5, 0)
    expect(result.deliveryZoneBlocked).toBe(false)
  })

  it('itemCount sums all quantities', () => {
    const items = [makeItem(10, 3), makeItem(5, 2)]
    const result = computeCartTotals(items, 'retrait', null, 0)
    expect(result.itemCount).toBe(5)
  })

  it('handles empty cart', () => {
    const result = computeCartTotals([], 'retrait', null, 0)
    expect(result.sousTotal).toBe(0)
    expect(result.totalFinal).toBe(0)
    expect(result.itemCount).toBe(0)
  })

  it('handles null reduction as 0', () => {
    const result = computeCartTotals([makeItem(10)], 'retrait', null, null)
    expect(result.reduction).toBe(0)
    expect(result.totalFinal).toBe(10)
  })
})
