import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const LIVRAISON_MINIMUM = 15
const LIVRAISON_OFFERTE_A = 20

const DELIVERY_RULES = [
  { min: 0, max: 3, frais: 3, tempsMin: 10, tempsMax: 12 },
  { min: 3, max: 5, frais: 4, tempsMin: 12, tempsMax: 15 },
  { min: 5, max: 7, frais: 5, tempsMin: 15, tempsMax: 17 },
]

function calcDeliveryFee(distanceKm, sousTotal) {
  const rule = DELIVERY_RULES.find(r => distanceKm >= r.min && distanceKm < r.max)
  if (!rule) return null
  if (sousTotal >= LIVRAISON_OFFERTE_A) return 0
  return rule.frais
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      mode: 'retrait', // 'livraison' | 'retrait'
      address: null,
      distanceKm: null,
      codePromo: null,
      reduction: 0,

      addItem: (product, quantity = 1, options = {}) => {
        set(state => {
          const key = `${product.id}-${JSON.stringify(options)}`
          const existing = state.items.find(i => i.key === key)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            }
          }
          return {
            items: [...state.items, { key, product, quantity, options }],
          }
        })
      },

      removeItem: (key) => {
        set(state => ({ items: state.items.filter(i => i.key !== key) }))
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key)
          return
        }
        set(state => ({
          items: state.items.map(i => i.key === key ? { ...i, quantity } : i),
        }))
      },

      clearCart: () => set({ items: [], codePromo: null, reduction: 0 }),

      setMode: (mode) => set({ mode }),
      setAddress: (address) => set({ address }),
      setDistance: (km) => set({ distanceKm: km }),
      applyCode: (code, reduction) => set({ codePromo: code, reduction }),
      removeCode: () => set({ codePromo: null, reduction: 0 }),

      get sousTotal() {
        return get().items.reduce((sum, i) => {
          const optionsPrice = Object.values(i.options).reduce(
            (s, o) => s + (o?.prix_supplement || 0), 0
          )
          return sum + (i.product.prix_ttc + optionsPrice) * i.quantity
        }, 0)
      },

      get fraisLivraison() {
        const state = get()
        if (state.mode !== 'livraison') return 0
        if (state.distanceKm === null) return 0
        return calcDeliveryFee(state.distanceKm, state.sousTotal) ?? 0
      },

      get totalFinal() {
        const state = get()
        return Math.max(0, state.sousTotal + state.fraisLivraison - state.reduction)
      },

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get isDeliveryEligible() {
        const state = get()
        if (state.mode !== 'livraison') return true
        return state.sousTotal >= LIVRAISON_MINIMUM
      },

      get deliveryZoneBlocked() {
        const state = get()
        return state.mode === 'livraison' && state.distanceKm !== null && state.distanceKm >= 7
      },
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

export { LIVRAISON_MINIMUM, LIVRAISON_OFFERTE_A, DELIVERY_RULES, calcDeliveryFee }
