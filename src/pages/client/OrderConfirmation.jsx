import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/utils/format'
import { CheckCircle, Clock, Loader2, ChefHat, Truck, Package, AlertCircle } from 'lucide-react'
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

export default function OrderConfirmation() {
  useSeo({ title: 'Confirmation de commande' })
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(nom))')
        .eq('id', id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`order-confirmation-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  if (loading) return <div className="flex items-center justify-center min-h-64"><Loader2 size={28} className="animate-spin" /></div>
  if (!order) return <div className="text-center py-16 text-semous-gray-text">Commande introuvable</div>

  const currentStepIdx = getStepIndex(order.statut)
  const isRefused = order.statut === 'refusee' || order.statut === 'annulee'
  const isDelivery = order.type === 'livraison'
  const visibleSteps = STATUS_STEPS.filter(s => {
    if (!isDelivery && s.key === 'en_livraison') return false
    if (!isDelivery && s.key === 'livree') return false
    return true
  })
  const currentDesc = STATUS_STEPS.find(s => s.key === order.statut)?.desc

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
          ${isRefused ? 'bg-red-100' : 'bg-green-100'}`}>
          {isRefused
            ? <AlertCircle size={32} className="text-red-600" />
            : <CheckCircle size={32} className="text-green-600" />}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isRefused ? 'Commande refusée' : 'Commande confirmée !'}
        </h1>
        <p className="text-semous-gray-text text-sm">
          {isRefused
            ? 'Votre commande n\'a pas pu être honorée. Si vous avez payé en ligne, le remboursement sera effectué sous 3-5 jours.'
            : currentDesc || 'Suivez l\'avancement de votre commande en temps réel.'}
        </p>
      </div>

      {/* Status tracker */}
      {!isRefused && (
        <div className="card p-5 mb-6">
          <p className="font-semibold text-sm mb-5">Suivi en temps réel</p>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-semous-gray" />
            {currentStepIdx > 0 && (
              <div
                className="absolute left-5 top-5 w-0.5 bg-semous-black transition-all duration-500"
                style={{ height: `${Math.min(currentStepIdx / (visibleSteps.length - 1), 1) * 100}%` }}
              />
            )}

            <div className="flex flex-col gap-5 relative">
              {visibleSteps.map((step, _i) => {
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

      {/* Order recap */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold">{order.numero}</p>
          <span className="text-xs text-semous-gray-text capitalize">{order.type}</span>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between">
              <span className="text-semous-gray-text">{item.products?.nom} ×{item.quantite}</span>
              <span>{formatPrice(item.prix_unitaire_ttc * item.quantite)}</span>
            </div>
          ))}
          {order.frais_livraison > 0 && (
            <div className="flex justify-between text-semous-gray-text">
              <span>Livraison</span>
              <span>{formatPrice(order.frais_livraison)}</span>
            </div>
          )}
          {order.reduction > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Réduction</span>
              <span>-{formatPrice(order.reduction)}</span>
            </div>
          )}
          <div className="border-t border-semous-gray-mid pt-2 mt-1 flex justify-between font-bold">
            <span>Total TTC</span>
            <span>{formatPrice(order.total_ttc)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-semous-gray-text mb-8">
        <Clock size={12} />
        <span>Passée le {formatDate(order.created_at)}</span>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/menu" className="btn-primary w-full text-center">Commander à nouveau</Link>
        <Link to="/compte" className="btn-secondary w-full text-center">Voir toutes mes commandes</Link>
      </div>
    </div>
  )
}
