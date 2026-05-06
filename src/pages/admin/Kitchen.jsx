import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel } from '@/utils/format'
import { Clock, Check, X, Plus, Printer, Maximize2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const KITCHEN_STATUSES = ['acceptee', 'en_preparation', 'prete']

export default function Kitchen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    loadOrders()

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(quantite, instructions, options, products(nom))')
      .in('statut', KITCHEN_STATUSES)
      .order('created_at')
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(orderId, newStatus, oldStatus) {
    const { error } = await supabase.from('orders').update({ statut: newStatus }).eq('id', orderId)
    if (error) { toast.error('Erreur'); return }
    await supabase.from('order_status_history').insert({ order_id: orderId, ancien_statut: oldStatus, nouveau_statut: newStatus })
    toast.success(orderStatusLabel(newStatus))
  }

  async function addDelay(orderId, minutes) {
    await supabase.from('order_notes').insert({ order_id: orderId, contenu: `+${minutes} min ajoutées en cuisine` })
    toast.success(`+${minutes} min noté`)
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div className={`${fullscreen ? 'fixed inset-0 bg-gray-950 text-white z-50 overflow-auto p-6' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mode cuisine</h1>
        <button onClick={() => setFullscreen(f => !f)} className="p-2 rounded-lg border border-current opacity-60 hover:opacity-100">
          <Maximize2 size={16} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <Check size={48} className="mx-auto mb-3" />
          <p className="text-lg">Aucune commande en cuisine</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map(order => (
            <div key={order.id} className={`rounded-2xl border-2 p-5 flex flex-col gap-4
              ${fullscreen ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-semous-gray-mid'}
              ${order.statut === 'en_preparation' ? 'border-orange-400' : ''}
              ${order.statut === 'prete' ? 'border-green-500' : ''}
            `}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{order.numero}</p>
                  <p className="text-xs opacity-60">{formatDate(order.created_at)} · {order.type}</p>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full
                  ${order.statut === 'acceptee' ? 'bg-blue-100 text-blue-800' : ''}
                  ${order.statut === 'en_preparation' ? 'bg-orange-100 text-orange-800' : ''}
                  ${order.statut === 'prete' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {orderStatusLabel(order.statut)}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2">
                {order.order_items?.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-lg leading-none w-6 shrink-0">{item.quantite}×</span>
                    <div>
                      <p className="font-medium">{item.products?.nom}</p>
                      {item.instructions && <p className="text-xs opacity-60 mt-0.5">⚠ {item.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Timer */}
              <OrderTimer createdAt={order.created_at} />

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-current/10">
                {order.statut === 'acceptee' && (
                  <button onClick={() => updateStatus(order.id, 'en_preparation', order.statut)} className="btn-primary text-xs py-2 flex-1">
                    En préparation
                  </button>
                )}
                {order.statut === 'en_preparation' && (
                  <button onClick={() => updateStatus(order.id, 'prete', order.statut)} className="btn-green text-xs py-2 flex-1">
                    <Check size={14} className="inline mr-1" />Prête
                  </button>
                )}
                {[10, 20, 30].map(min => (
                  <button key={min} onClick={() => addDelay(order.id, min)} className="text-xs px-2 py-2 rounded-lg border border-current/20 hover:bg-black/5">
                    +{min}m
                  </button>
                ))}
                <button onClick={() => window.print()} className="text-xs px-2 py-2 rounded-lg border border-current/20 hover:bg-black/5">
                  <Printer size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt)) / 60000))
    }, 30000)
    setElapsed(Math.floor((Date.now() - new Date(createdAt)) / 60000))
    return () => clearInterval(interval)
  }, [createdAt])
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${elapsed > 15 ? 'text-red-500' : elapsed > 10 ? 'text-orange-500' : 'text-green-600'}`}>
      <Clock size={12} />{elapsed} min
    </div>
  )
}
