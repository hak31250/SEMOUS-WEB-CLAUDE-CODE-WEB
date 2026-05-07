import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/utils/format'
import { CheckCircle, Clock, Loader2, ChefHat, Truck, Package, AlertCircle, Search } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

const STATUS_STEPS = [
  { key: 'en_attente_validation', label: 'Reçue', icon: Package, desc: 'Votre commande est bien reçue.' },
  { key: 'acceptee', label: 'Acceptée', icon: CheckCircle, desc: 'Votre commande a été acceptée !' },
  { key: 'en_preparation', label: 'En préparation', icon: ChefHat, desc: 'Nos cuisiniers préparent votre commande.' },
  { key: 'prete', label: 'Prête', icon: CheckCircle, desc: 'Votre commande est prête !' },
  { key: 'en_livraison', label: 'En livraison', icon: Truck, desc: 'Le livreur est en route !' },
  { key: 'livree', label: 'Livrée', icon: CheckCircle, desc: 'Commande livrée. Bon appétit !' },
  { key: 'terminee', label: 'Terminée', icon: CheckCircle, desc: 'Commande terminée. Merci !' },
]

function getStepIndex(statut) {
  return STATUS_STEPS.findIndex(s => s.key === statut)
}

export default function OrderTracking() {
  useSeo({ title: 'Suivi de commande', description: 'Suivez votre commande SEMOUS en temps réel grâce à votre numéro de commande.' })
  const { numero } = useParams()
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState(numero || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [channelRef, setChannelRef] = useState(null)

  useEffect(() => {
    if (numero) {
      fetchOrder(numero)
    }
    // Cleanup on unmount
    return () => {
      if (channelRef) supabase.removeChannel(channelRef)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numero])

  async function fetchOrder(num) {
    setLoading(true)
    setNotFound(false)
    setOrder(null)

    // Remove any existing realtime channel
    if (channelRef) {
      supabase.removeChannel(channelRef)
      setChannelRef(null)
    }

    const { data, error } = await supabase
      .from('orders')
      .select('numero, statut, type, total_ttc, created_at')
      .eq('numero', num.trim().toUpperCase())
      .single()

    setLoading(false)

    if (error || !data) {
      setNotFound(true)
      return
    }

    setOrder(data)

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-tracking-${data.numero}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `numero=eq.${data.numero}` },
        (payload) => {
          setOrder(prev => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    setChannelRef(channel)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = inputValue.trim().toUpperCase()
    if (!trimmed) return
    // Navigate to URL with numero to keep URL shareable
    navigate(`/suivi/${trimmed}`)
    if (trimmed === numero) {
      // Same numero, just re-fetch
      fetchOrder(trimmed)
    }
  }

  const currentStepIdx = order ? getStepIndex(order.statut) : -1
  const isRefused = order && (order.statut === 'refusee' || order.statut === 'annulee')
  const isDelivery = order?.type === 'livraison'
  const visibleSteps = STATUS_STEPS.filter(s => {
    if (!isDelivery && s.key === 'en_livraison') return false
    if (!isDelivery && s.key === 'livree') return false
    return true
  })
  const currentDesc = order ? STATUS_STEPS.find(s => s.key === order.statut)?.desc : null

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="section-title mb-2">Suivi de commande</h1>
        <p className="text-sm text-semous-gray-text">
          Entrez votre numéro de commande (format SEM-XXXXXXXX) pour suivre son avancement en temps réel.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="SEM-XXXXXXXX"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          autoFocus={!numero}
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button type="submit" className="btn-primary flex items-center gap-2 px-4">
          <Search size={16} />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}

      {/* Not found */}
      {notFound && !loading && (
        <div className="card p-6 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
          <p className="font-semibold mb-1">Commande introuvable</p>
          <p className="text-sm text-semous-gray-text">
            Aucune commande ne correspond au numéro <span className="font-mono font-semibold">{inputValue.trim().toUpperCase()}</span>.
            Vérifiez le numéro reçu par SMS ou email.
          </p>
        </div>
      )}

      {/* Order found */}
      {order && !loading && (
        <>
          {/* Status header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isRefused ? 'bg-red-100' : 'bg-green-100'}`}>
              {isRefused
                ? <AlertCircle size={32} className="text-red-600" />
                : <CheckCircle size={32} className="text-green-600" />}
            </div>
            <p className="text-lg font-bold mb-1">
              {isRefused ? 'Commande refusée' : currentDesc || 'Commande en cours'}
            </p>
            {isRefused && (
              <p className="text-sm text-semous-gray-text">
                Votre commande n&apos;a pas pu être honorée. Si vous avez payé en ligne, le remboursement sera effectué sous 3-5 jours.
              </p>
            )}
          </div>

          {/* Order info card */}
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold">{order.numero}</p>
              <span className="text-xs text-semous-gray-text capitalize">{order.type}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-semous-gray-text mb-2">
              <Clock size={12} />
              <span>Passée le {formatDate(order.created_at)}</span>
            </div>
            <div className="border-t border-semous-gray-mid pt-3 mt-3 flex justify-between font-bold text-sm">
              <span>Total TTC</span>
              <span>{formatPrice(order.total_ttc)}</span>
            </div>
          </div>

          {/* Status tracker */}
          {!isRefused && (
            <div className="card p-5">
              <p className="font-semibold text-sm mb-5">Suivi en temps réel</p>
              <div className="relative">
                {/* Background progress line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-semous-gray" />
                {currentStepIdx > 0 && (
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-semous-black transition-all duration-500"
                    style={{ height: `${Math.min(currentStepIdx / (visibleSteps.length - 1), 1) * 100}%` }}
                  />
                )}

                <div className="flex flex-col gap-5 relative">
                  {visibleSteps.map((step) => {
                    const sIdx = getStepIndex(step.key)
                    const done = currentStepIdx >= sIdx && currentStepIdx !== -1
                    const active = order.statut === step.key
                    const Icon = step.icon
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all
                          ${active ? 'bg-semous-black border-semous-black text-white scale-110'
                            : done ? 'bg-semous-black border-semous-black text-white'
                            : 'bg-white border-semous-gray-mid text-semous-gray-text'}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${done ? 'text-semous-black' : 'text-semous-gray-text'}`}>
                            {step.label}
                            {active && <span className="ml-2 text-xs font-normal text-semous-gray-text animate-pulse">• maintenant</span>}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
