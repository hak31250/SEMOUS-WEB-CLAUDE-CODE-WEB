import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  role: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await get().loadProfile(session.user)
    }
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().loadProfile(session.user)
      } else {
        set({ user: null, profile: null, role: null })
      }
    })
  },

  loadProfile: async (user) => {
    set({ user })
    const { data: profile } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    set({ profile, role: userData?.role || 'client' })
  },

  signUp: async ({ email, password, prenom, nom, telephone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { prenom, nom } },
    })
    if (error) throw error

    if (data.user) {
      await supabase.from('customer_profiles').insert({
        user_id: data.user.id,
        prenom,
        nom,
        telephone,
      })
    }
    return data
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null })
  },

  isAdmin: () => ['admin'].includes(get().role),
  isCuisine: () => ['admin', 'cuisine'].includes(get().role),
  isLivreur: () => ['admin', 'livreur'].includes(get().role),
}))
