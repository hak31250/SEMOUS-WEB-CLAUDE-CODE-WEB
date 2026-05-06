import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const LIVRAISON_MINIMUM = 15
export const LIVRAISON_OFFERTE_A = 20

export const DELIVERY_RULES = [
  { min: 0, max: 3, frais: 3, tempsMin: 10, tempsMax: 12 },
  { min: 3, max: 5, frais: 4, tempsMin: 12, tempsMax: 15 },
  { min: 5, max: 7, frais: 5, tempsMin: 15, tempsMax: 17 },
]

export function calcDeliveryFee(distanceKm, sousTotal) {
  if (sousTotal >= LIVRAISON_OFFERTE_A) return 0
  const rule = DELIVERY_RULES.find(r => distanceKm >= r.min && distanceKm < r.max)
  return rule ? rule.frais : null
}

export function computeCartTotals(items, mode, distanceKm, reduction) {
  const sousTotal = items.reduce((sum, i) => {
    const optionsPrice = Object.values(i.options || {}).reduce(
      (s, o) => s + (o?.prix_supplement || 0), 0
    )
    return sum + (i.product.prix_ttc + optionsPrice) * i.quantity
  }, 0)

  const fraisLivraison = mode === 'livraison' && distanceKm !== null
    ? (calcDeliveryFee(distanceKm, sousTotal) ?? 0)
    : 0

  const totalFinal = Math.max(0, sousTotal + fraisLivraison - (reduction || 0))
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const isDeliveryEligible = mode !== 'livraison' || sousTotal >= LIVRAISON_MINIMUM
  const deliveryZoneBlocked = mode === 'livraison' && distanceKm !== null && distanceKm >= 7

  return { sousTotal, fraisLivraison, totalFinal, reduction: reduction || 0, itemCount, isDeliveryEligible, deliveryZoneBlocked }
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      mode: 'retrait',
      address: null,
      distanceKm: null,
      codePromo: null,
      reduction: 0,

      addItem: (product, quantity = 1, options = {}) => {
        set(state => {
          const key = `${product.id}-${JSON.stringify(options)}`
          const existing = state.items.find(i => i.key === key)
          if (existing) {
            return { items: state.items.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) }
          }
          return { items: [...state.items, { key, product, quantity, options }] }
        })
      },

      removeItem: (key) => set(state => ({ items: state.items.filter(i => i.key !== key) })),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) { get().removeItem(key); return }
        set(state => ({ items: state.items.map(i => i.key === key ? { ...i, quantity } : i) }))
      },

      clearCart: () => set({ items: [], codePromo: null, reduction: 0 }),
      setMode: (mode) => set({ mode }),
      setAddress: (address) => set({ address }),
      setDistance: (km) => set({ distanceKm: km }),
      applyCode: (code, reduction) => set({ codePromo: code, reduction }),
      removeCode: () => set({ codePromo: null, reduction: 0 }),
    }),
    {
      name: 'semous-cart',
      partialize: (state) => ({
        items: state.items,
        mode: state.mode,
        address: state.address,
        distanceKm: state.distanceKm,
        codePromo: state.codePromo,
        reduction: state.reduction,
      }),
    }
  )
)

export function useCartTotals() {
  return useCartStore(state => computeCartTotals(state.items, state.mode, state.distanceKm, state.reduction))
}
