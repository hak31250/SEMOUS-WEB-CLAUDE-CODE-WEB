import { describe, it, expect } from 'vitest'
import {
  haversineDistance,
  distanceFromRestaurant,
  isInDeliveryZone,
  getDeliveryFee,
  getDeliveryTime,
  buildWazeUrl,
  RESTAURANT_LAT,
  RESTAURANT_LNG,
} from '../utils/delivery'

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(43.5993, 1.4327, 43.5993, 1.4327)).toBe(0)
  })

  it('returns a positive distance for different coordinates', () => {
    const d = haversineDistance(43.5993, 1.4327, 43.61, 1.45)
    expect(d).toBeGreaterThan(0)
  })

  it('is symmetric (A→B == B→A)', () => {
    const d1 = haversineDistance(43.5993, 1.4327, 43.65, 1.50)
    const d2 = haversineDistance(43.65, 1.50, 43.5993, 1.4327)
    expect(d1).toBeCloseTo(d2, 6)
  })

  it('computes a known distance within reasonable margin', () => {
    // Toulouse city center to the restaurant: roughly ~1-2 km
    const d = haversineDistance(43.6047, 1.4442, 43.5993, 1.4327)
    expect(d).toBeGreaterThan(0.5)
    expect(d).toBeLessThan(3)
  })
})

describe('distanceFromRestaurant', () => {
  it('returns 0 when the point is the restaurant itself', () => {
    expect(distanceFromRestaurant(RESTAURANT_LAT, RESTAURANT_LNG)).toBe(0)
  })

  it('returns a positive distance for a nearby point', () => {
    const d = distanceFromRestaurant(43.61, 1.44)
    expect(d).toBeGreaterThan(0)
  })

  it('uses RESTAURANT_LAT / RESTAURANT_LNG as origin', () => {
    const expected = haversineDistance(RESTAURANT_LAT, RESTAURANT_LNG, 43.65, 1.50)
    expect(distanceFromRestaurant(43.65, 1.50)).toBeCloseTo(expected, 6)
  })
})

describe('isInDeliveryZone', () => {
  it('returns true for a point within 7 km', () => {
    // Very close to the restaurant
    expect(isInDeliveryZone(43.60, 1.43)).toBe(true)
  })

  it('returns false for a point beyond 7 km', () => {
    // Muret (sud de Toulouse) est à ~18 km du restaurant
    expect(isInDeliveryZone(43.464, 1.337)).toBe(false)
  })

  it('returns true for the restaurant location itself (0 km)', () => {
    expect(isInDeliveryZone(RESTAURANT_LAT, RESTAURANT_LNG)).toBe(true)
  })
})

describe('getDeliveryFee', () => {
  it('returns 3 EUR for distance < 3 km (below free threshold)', () => {
    expect(getDeliveryFee(1, 10)).toBe(3)
    expect(getDeliveryFee(2.9, 10)).toBe(3)
  })

  it('returns 4 EUR for 3 km <= distance < 5 km', () => {
    expect(getDeliveryFee(3, 10)).toBe(4)
    expect(getDeliveryFee(4.9, 10)).toBe(4)
  })

  it('returns 5 EUR for 5 km <= distance < 7 km', () => {
    expect(getDeliveryFee(5, 10)).toBe(5)
    expect(getDeliveryFee(6.9, 10)).toBe(5)
  })

  it('returns null for distance >= 7 km (blocked zone)', () => {
    expect(getDeliveryFee(7, 10)).toBeNull()
    expect(getDeliveryFee(10, 10)).toBeNull()
  })

  it('returns 0 when sousTotal >= 20 EUR (free delivery threshold)', () => {
    expect(getDeliveryFee(1, 20)).toBe(0)
    expect(getDeliveryFee(5, 25)).toBe(0)
    expect(getDeliveryFee(6, 20)).toBe(0)
  })

  it('does not give free delivery when sousTotal is just below 20 EUR', () => {
    expect(getDeliveryFee(1, 19.99)).toBe(3)
  })
})

describe('getDeliveryTime', () => {
  it('returns "10–12 min" for distance < 3 km', () => {
    expect(getDeliveryTime(1)).toBe('10–12 min')
    expect(getDeliveryTime(2.9)).toBe('10–12 min')
  })

  it('returns "12–15 min" for 3 km <= distance < 5 km', () => {
    expect(getDeliveryTime(3)).toBe('12–15 min')
    expect(getDeliveryTime(4.9)).toBe('12–15 min')
  })

  it('returns "15–17 min" for 5 km <= distance < 7 km', () => {
    expect(getDeliveryTime(5)).toBe('15–17 min')
    expect(getDeliveryTime(6.9)).toBe('15–17 min')
  })

  it('returns null for distance >= 7 km', () => {
    expect(getDeliveryTime(7)).toBeNull()
    expect(getDeliveryTime(15)).toBeNull()
  })
})

describe('buildWazeUrl', () => {
  it('returns a URL starting with https://waze.com', () => {
    expect(buildWazeUrl('32 avenue Honoré Serres, Toulouse')).toMatch(/^https:\/\/waze\.com/)
  })

  it('includes navigate=yes in the URL', () => {
    expect(buildWazeUrl('32 avenue Honoré Serres, Toulouse')).toContain('navigate=yes')
  })

  it('URL-encodes the address', () => {
    const url = buildWazeUrl('32 avenue Honoré Serres')
    expect(url).not.toContain(' ')
    expect(url).toContain('32')
  })

  it('includes the address query parameter', () => {
    const url = buildWazeUrl('test address')
    expect(url).toContain('q=')
  })
})
