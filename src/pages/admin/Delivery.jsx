import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/utils/format'
import { MapPin, Phone, Navigation, Package, CheckCircle, Loader2 } from 'lucide-react'
import { buildWazeUrl } from '@/utils/delivery'
import toast from 'react-hot-toast'

export default function Delivery() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    const ch = supabase
      .channel('delivery-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, addresses(*)')
      .in('statut', ['prete', 'en_livraison'])
      .eq('type', 'livraison')
      .order('created_at')
    setOrders(data || [])
    setLoading(false)
  }

  async function setStatus(orderId, status, oldStatus) {
    await supabase.from('orders').update({ statut: status }).eq('id', orderId)
    await supabase.from('order_status_history').insert({ order_id: orderId, ancien_statut: oldStatus, nouveau_statut: status })
    toast.success(status === 'en_livraison' ? 'En livraison !' : 'Commande livrée !')
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Livraisons</h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-semous-gray-text">
          <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
          <p>Aucune livraison en attente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => {
            const addr = order.addresses
            const addressStr = addr ? `${addr.rue}${addr.complement ? ', ' + addr.complement : ''}, ${addr.code_postal} ${addr.ville}` : ''
            return (
              <div key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-bold">{order.numero}</p>
                    <p className="text-xs text-semous-gray-text">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{formatPrice(order.total_ttc)}</span>
                    {order.zone_km && (
                      <span className="badge bg-blue-100 text-blue-800">{order.zone_km?.toFixed(1)} km</span>
                    )}
                    {order.cout_livraison_interne && (
                      <span className="text-xs text-semous-gray-text">Coût: {formatPrice(order.cout_livraison_interne)}</span>
                    )}
                  </div>
                </div>

                {addressStr && (
                  <div className="flex items-start gap-2 text-sm mb-3">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-semous-gray-text" />
                    <span>{addressStr}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {addressStr && (
                    <a
                      href={buildWazeUrl(addressStr)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 btn-secondary text-sm py-2"
                    >
                      <Navigation size={14} />Waze
                    </a>
                  )}
                  {order.statut === 'prete' && (
                    <button onClick={() => setStatus(order.id, 'en_livraison', order.statut)} className="btn-primary text-sm py-2 flex items-center gap-1.5">
                      <Package size={14} />En livraison
                    </button>
                  )}
                  {order.statut === 'en_livraison' && (
                    <button onClick={() => setStatus(order.id, 'livree', order.statut)} className="btn-green text-sm py-2 flex items-center gap-1.5">
                      <CheckCircle size={14} />Livrée
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
