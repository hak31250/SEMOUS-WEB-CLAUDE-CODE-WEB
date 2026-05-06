import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { Search, Filter, Eye, Loader2 } from 'lucide-react'

const ALL_STATUSES = ['en_attente_validation', 'acceptee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'terminee', 'refusee', 'annulee', 'litige']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => { load() }, [filterStatus])

  async function load() {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, order_items(quantite, prix_unitaire_ttc, products(nom))')
      .order('created_at', { ascending: false })
      .limit(100)
    if (filterStatus) query = query.eq('statut', filterStatus)
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId)
    await supabase.from('orders').update({ statut: newStatus }).eq('id', orderId)
    await supabase.from('order_status_history').insert({ order_id: orderId, ancien_statut: order?.statut, nouveau_statut: newStatus })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: newStatus } : o))
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, statut: newStatus }))
  }

  const filtered = orders.filter(o =>
    !search || o.numero?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-6 h-full">
      {/* Liste */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h1 className="text-2xl font-bold shrink-0">Commandes</h1>
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-semous-gray-text" />
              <input
                className="input-field pl-9 text-sm"
                placeholder="N° commande..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input-field text-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tous les statuts</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`card p-4 text-left hover:shadow-md transition-shadow w-full
                  ${selectedOrder?.id === order.id ? 'ring-2 ring-semous-black' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{order.numero}</p>
                    <p className="text-xs text-semous-gray-text">{formatDate(order.created_at)} · {order.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{formatPrice(order.total_ttc)}</span>
                    <span className={`badge ${orderStatusColor(order.statut)}`}>{orderStatusLabel(order.statut)}</span>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-12 text-semous-gray-text">Aucune commande trouvée</p>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedOrder && (
        <div className="w-80 shrink-0 hidden xl:block">
          <OrderDetail order={selectedOrder} onUpdateStatus={updateStatus} onClose={() => setSelectedOrder(null)} />
        </div>
      )}
    </div>
  )
}

function OrderDetail({ order, onUpdateStatus, onClose }) {
  const statusActions = {
    en_attente_validation: [
      { label: 'Accepter', status: 'acceptee', style: 'btn-primary' },
      { label: 'Refuser', status: 'refusee', style: 'border border-red-400 text-red-600 text-sm py-2 px-4 rounded-lg hover:bg-red-50' },
    ],
    acceptee: [{ label: 'En préparation', status: 'en_preparation', style: 'btn-primary' }],
    en_preparation: [{ label: 'Prête', status: 'prete', style: 'btn-green' }],
    prete: [{ label: 'En livraison', status: 'en_livraison', style: 'btn-primary' }],
    en_livraison: [{ label: 'Livrée', status: 'livree', style: 'btn-green' }],
    livree: [{ label: 'Terminée', status: 'terminee', style: 'btn-primary' }],
  }

  return (
    <div className="card p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold">{order.numero}</p>
        <button onClick={onClose} className="text-semous-gray-text hover:text-semous-black">✕</button>
      </div>

      <div className="flex flex-col gap-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Statut</span>
          <span className={`badge ${orderStatusColor(order.statut)}`}>{orderStatusLabel(order.statut)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Mode</span>
          <span className="capitalize">{order.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Total</span>
          <span className="font-bold">{formatPrice(order.total_ttc)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Date</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
      </div>

      <div className="border-t border-semous-gray-mid pt-4 mb-4">
        <p className="font-semibold text-sm mb-2">Articles</p>
        {order.order_items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{item.products?.nom} ×{item.quantite}</span>
            <span>{formatPrice(item.prix_unitaire_ttc * item.quantite)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusActions[order.statut]?.map(action => (
          <button key={action.status} onClick={() => onUpdateStatus(order.id, action.status)} className={`${action.style} text-sm py-2 px-4`}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
