import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(nom, photo_url))')
        .eq('id', id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  if (loading) return <div className="flex items-center justify-center min-h-64"><Loader2 size={28} className="animate-spin" /></div>
  if (!order) return <div className="text-center py-16">Commande introuvable</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Commande reçue !</h1>
        <p className="text-semous-gray-text text-sm">
          Votre commande est bien reçue. Elle est en attente de validation par SEMOUS.
          Vous serez informé dès que la commande sera acceptée ou refusée.
        </p>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold">{order.numero}</p>
          <span className={`badge ${orderStatusColor(order.statut)}`}>
            {orderStatusLabel(order.statut)}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.products?.nom} ×{item.quantite}</span>
              <span>{formatPrice(item.prix_unitaire_ttc * item.quantite)}</span>
            </div>
          ))}
          <div className="border-t border-semous-gray-mid pt-2 mt-1 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total_ttc)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-semous-gray-text mb-8">
        <Clock size={14} />
        <span>Commande passée le {formatDate(order.created_at)}</span>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/menu" className="btn-primary w-full text-center">Nouvelle commande</Link>
        <Link to="/compte" className="btn-secondary w-full text-center">Voir mon compte</Link>
      </div>
    </div>
  )
}
