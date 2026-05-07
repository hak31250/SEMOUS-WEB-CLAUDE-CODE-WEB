import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/utils/format'
import { MapPin, Navigation, Package, CheckCircle, Loader2, Users, Phone } from 'lucide-react'
import { buildWazeUrl } from '@/utils/delivery'
import toast from 'react-hot-toast'

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function groupNearbyOrders(orders) {
  const withCoords = orders.filter(o => o.addresses?.latitude && o.addresses?.longitude)
  const groups = []
  const assigned = new Set()

  withCoords.forEach((order, i) => {
    if (assigned.has(order.id)) return
    const group = [order]
    assigned.add(order.id)
    const lat1 = order.addresses.latitude
    const lng1 = order.addresses.longitude
    withCoords.forEach((other, j) => {
      if (i === j || assigned.has(other.id)) return
      const dist = haversine(lat1, lng1, other.addresses.latitude, other.addresses.longitude)
      const timeDiff = Math.abs(new Date(order.created_at) - new Date(other.created_at)) / 60000
      if (dist <= 1.5 && timeDiff <= 30) {
        group.push(other)
        assigned.add(other.id)
      }
    })
    groups.push(group)
  })
  orders.filter(o => !o.addresses?.latitude).forEach(o => {
    if (!assigned.has(o.id)) groups.push([o])
  })
  return groups
}

export default function Delivery() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupView, setGroupView] = useState(false)

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
      .select('*, addresses(*), customer_profiles(telephone), guest_customers(telephone)')
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

  const groups = groupNearbyOrders(orders)
  const hasGroupSuggestion = groups.some(g => g.length > 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Livraisons</h1>
        {hasGroupSuggestion && (
          <button
            onClick={() => setGroupView(v => !v)}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${groupView ? 'bg-semous-black text-white border-semous-black' : 'border-semous-gray-mid text-semous-gray-text'}`}
          >
            <Users size={14} />
            {groupView ? 'Vue groupée' : 'Voir regroupements'}
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-semous-gray-text">
          <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
          <p>Aucune livraison en attente</p>
        </div>
      ) : groupView ? (
        <div className="flex flex-col gap-6">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.length > 1 && (
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-blue-600" />
                  <p className="text-sm font-semibold text-blue-600">
                    Tournée suggérée — {group.length} commandes proches
                  </p>
                </div>
              )}
              <div className={`flex flex-col gap-3 ${group.length > 1 ? 'border-2 border-blue-200 rounded-2xl p-3 bg-blue-50/30' : ''}`}>
                {group.map(order => (
                  <DeliveryCard key={order.id} order={order} onSetStatus={setStatus} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <DeliveryCard key={order.id} order={order} onSetStatus={setStatus} />
          ))}
        </div>
      )}
    </div>
  )
}

function DeliveryCard({ order, onSetStatus }) {
  const addr = order.addresses
  const addressStr = addr ? `${addr.rue}${addr.complement ? ', ' + addr.complement : ''}, ${addr.code_postal} ${addr.ville}` : ''

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-bold">{order.numero}</p>
          <p className="text-xs text-semous-gray-text">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">{formatPrice(order.total_ttc)}</span>
          {order.zone_km && <span className="badge bg-blue-100 text-blue-800">{order.zone_km?.toFixed(1)} km</span>}
          {order.statut === 'en_livraison' && <span className="badge bg-orange-100 text-orange-800">En livraison</span>}
        </div>
      </div>

      {addressStr && (
        <div className="flex items-start gap-2 text-sm mb-3">
          <MapPin size={14} className="mt-0.5 shrink-0 text-semous-gray-text" />
          <span>{addressStr}</span>
        </div>
      )}

      {order.addresses?.instructions_livraison && (
        <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mb-3">
          ⚠ {order.addresses.instructions_livraison}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {addressStr && (
          <a href={buildWazeUrl(addressStr)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 btn-secondary text-sm py-2">
            <Navigation size={14} />Waze
          </a>
        )}
        {(order.customer_profiles?.telephone || order.guest_customers?.telephone) && (
          <a href={`tel:${order.customer_profiles?.telephone || order.guest_customers?.telephone}`}
            className="flex items-center gap-1.5 btn-secondary text-sm py-2">
            <Phone size={14} />Appeler
          </a>
        )}
        {order.statut === 'prete' && (
          <button onClick={() => onSetStatus(order.id, 'en_livraison', order.statut)} className="btn-primary text-sm py-2 flex items-center gap-1.5 flex-1">
            <Package size={14} />Partir en livraison
          </button>
        )}
        {order.statut === 'en_livraison' && (
          <button onClick={() => onSetStatus(order.id, 'livree', order.statut)} className="btn-green text-sm py-2 flex items-center gap-1.5 flex-1">
            <CheckCircle size={14} />Livrée
          </button>
        )}
      </div>
    </div>
  )
}
