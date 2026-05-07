const RESTAURANT_LAT = 43.5993
const RESTAURANT_LNG = 1.4327

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distanceFromRestaurant(lat, lng) {
  return haversineDistance(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng)
}

export function isInDeliveryZone(lat, lng) {
  return distanceFromRestaurant(lat, lng) <= 7
}

export function getDeliveryFee(distanceKm, sousTotal) {
  if (sousTotal >= 20) return 0
  if (distanceKm < 3) return 3
  if (distanceKm < 5) return 4
  if (distanceKm < 7) return 5
  return null
}

export function getDeliveryTime(distanceKm) {
  if (distanceKm < 3) return '10–12 min'
  if (distanceKm < 5) return '12–15 min'
  if (distanceKm < 7) return '15–17 min'
  return null
}

export function buildWazeUrl(address) {
  const encoded = encodeURIComponent(address)
  return `https://waze.com/ul?q=${encoded}&navigate=yes`
}

export { RESTAURANT_LAT, RESTAURANT_LNG }
