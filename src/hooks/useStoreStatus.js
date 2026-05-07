import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const HOURS = {
  1: [19, 24],
  2: [19, 24],
  3: [19, 24],
  4: [19, 24],
  5: [19, 26],
  6: [19, 26],
  0: [19, 24],
}

function isOpenNow() {
  const now = new Date()
  const paris = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
  let hour = paris.getHours() + paris.getMinutes() / 60
  const day = paris.getDay()

  if (hour < 6) {
    const prevDay = day === 0 ? 6 : day - 1
    const [, close] = HOURS[prevDay] || [0, 0]
    return hour + 24 <= close
  }

  const [open, close] = HOURS[day] || [0, 0]
  return hour >= open && hour < close
}

export function useStoreStatus() {
  const [open, setOpen] = useState(isOpenNow)
  const [commandesActives, setCommandesActives] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('settings')
      .select('cle,valeur')
      .in('cle', ['commandes_actives', 'message_fermeture'])
      .then(({ data }) => {
        data?.forEach(s => {
          if (s.cle === 'commandes_actives') setCommandesActives(s.valeur !== 'false')
          if (s.cle === 'message_fermeture') setMessage(s.valeur || '')
        })
      })

    const interval = setInterval(() => setOpen(isOpenNow()), 60000)
    return () => clearInterval(interval)
  }, [])

  return {
    isOpen: open && commandesActives,
    commandesActives,
    hoursOpen: open,
    closedMessage: message || (commandesActives ? '' : 'Les commandes sont temporairement fermées.'),
  }
}
