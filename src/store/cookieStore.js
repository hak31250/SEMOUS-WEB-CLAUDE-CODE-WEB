import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCookieStore = create(
  persist(
    (set) => ({
      shown: false,
      accepted: null,
      preferences: {
        essential: true,
        analytics: false,
        marketing: false,
      },

      acceptAll: () => set({
        shown: true,
        accepted: true,
        preferences: { essential: true, analytics: true, marketing: true },
      }),

      rejectAll: () => set({
        shown: true,
        accepted: false,
        preferences: { essential: true, analytics: false, marketing: false },
      }),

      savePreferences: (prefs) => set({
        shown: true,
        accepted: true,
        preferences: { essential: true, ...prefs },
      }),

      resetConsent: () => set({ shown: false, accepted: null }),
    }),
    { name: 'semous-cookie-consent' }
  )
)
