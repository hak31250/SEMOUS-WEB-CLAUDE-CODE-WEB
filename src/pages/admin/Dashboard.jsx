import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { ShoppingBag, TrendingUp, Clock, AlertCircle, Volume2, VolumeX, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ORDER_STATUSES = ['en_attente_validation', 'acceptee', 'en_preparation', 'prete', 'en_livraison']

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ total_ttc: 0, count: 0, panier_moyen: 0 })
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    loadOrders()

    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev])
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => {})
          }
          toast('🛎 Nouvelle commande reçue !')
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [soundEnabled])

  async function loadOrders() {
    setLoading(true)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [{ data: activeOrders }, { data: todayOrders }] = await Promise.all([
      supabase.from('orders').select('*').in('statut', ORDER_STATUSES).order('created_at', { ascending: false }),
      supabase.from('orders').select('total_ttc').gte('created_at', today.toISOString()).eq('statut', 'terminee'),
    ])

    setOrders(activeOrders || [])
    const total = (todayOrders || []).reduce((s, o) => s + (o.total_ttc || 0), 0)
    setStats({ total_ttc: total, count: todayOrders?.length || 0, panier_moyen: todayOrders?.length ? total / todayOrders.length : 0 })
    setLoading(false)
  }

  async function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId)
    const { error } = await supabase.from('orders').update({ statut: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    if (error) { toast.error('Erreur mise à jour'); return }
    await supabase.from('order_status_history').insert({ order_id: orderId, ancien_statut: order?.statut, nouveau_statut: newStatus })
    toast.success(`Commande ${orderStatusLabel(newStatus).toLowerCase()}`)
  }

  const nextStatus = {
    en_attente_validation: 'acceptee',
    acceptee: 'en_preparation',
    en_preparation: 'prete',
    prete: 'en_livraison',
    en_livraison: 'livree',
  }

  const nextStatusLabel = {
    en_attente_validation: 'Accepter',
    acceptee: 'En préparation',
    en_preparation: 'Prête',
    prete: 'En livraison',
    en_livraison: 'Livrée',
  }

  return (
    <div>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setSoundEnabled(s => !s)}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors
            ${soundEnabled ? 'bg-semous-black text-white border-semous-black' : 'border-semous-gray-mid text-semous-gray-text'}`}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          Sonnerie
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'CA du jour', value: formatPrice(stats.total_ttc), color: 'text-green-600' },
          { icon: ShoppingBag, label: 'Commandes terminées', value: stats.count, color: 'text-blue-600' },
          { icon: Clock, label: 'Panier moyen', value: formatPrice(stats.panier_moyen), color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <stat.icon size={20} className={`mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-semous-gray-text mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Commandes en cours</h2>
        <span className="badge bg-semous-black text-white">{orders.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center text-semous-gray-text">
          <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
          <p>Aucune commande active</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={() => nextStatus[order.statut] && updateOrderStatus(order.id, nextStatus[order.statut])}
              onRefuse={() => updateOrderStatus(order.id, 'refusee')}
              advanceLabel={nextStatusLabel[order.statut]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onAdvance, onRefuse, advanceLabel }) {
  const age = Math.floor((Date.now() - new Date(order.created_at)) / 60000)
  const isLate = order.statut === 'en_attente_validation' && age >= 2

  return (
    <div className={`card p-4 flex flex-col gap-3 ${isLate ? 'border-red-300 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-sm">{order.numero}</p>
          <p className="text-xs text-semous-gray-text">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`badge ${orderStatusColor(order.statut)}`}>{orderStatusLabel(order.statut)}</span>
          <span className="text-xs text-semous-gray-text capitalize">{order.type}</span>
        </div>
      </div>

      {isLate && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle size={12} />
          Validation en attente depuis {age} min
        </div>
      )}

      <div className="flex items-center justify-between text-sm font-bold border-t border-semous-gray-mid pt-2">
        <span>{formatPrice(order.total_ttc)}</span>
        <span className="text-semous-gray-text text-xs">
          {order.type === 'livraison' ? `${order.zone_km?.toFixed(1) || '?'} km` : 'Retrait'}
        </span>
      </div>

      <div className="flex gap-2">
        {advanceLabel && (
          <button onClick={onAdvance} className="btn-primary text-xs py-2 flex-1">{advanceLabel}</button>
        )}
        {order.statut === 'en_attente_validation' && (
          <button onClick={onRefuse} className="border border-red-400 text-red-600 text-xs py-2 px-3 rounded-lg hover:bg-red-50">
            Refuser
          </button>
        )}
      </div>
    </div>
  )
}
