import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, orderStatusLabel } from '@/utils/format'
import { Clock, Check, AlertTriangle, Printer, Maximize2, Loader2 } from 'lucide-react'
import { printTicket } from '@/components/admin/OrderTicket'
import toast from 'react-hot-toast'

const KITCHEN_STATUSES = ['acceptee', 'en_preparation', 'prete']

export default function Kitchen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [ruptureModal, setRuptureModal] = useState(null)

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
      .select('*, order_items(quantite, instructions, options, products(nom, id))')
      .in('statut', KITCHEN_STATUSES)
      .order('created_at')
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(order, newStatus) {
    const { error } = await supabase.from('orders').update({ statut: newStatus }).eq('id', order.id)
    if (error) { toast.error('Erreur'); return }
    await supabase.from('order_status_history').insert({ order_id: order.id, ancien_statut: order.statut, nouveau_statut: newStatus })
    if (newStatus === 'en_preparation') {
      const { data } = await supabase.from('orders')
        .select('*, order_items(*, products(nom)), addresses(*)')
        .eq('id', order.id).single()
      if (data) {
        setTimeout(() => printTicket(data, data.order_items), 200)
        toast.success('Ticket imprimé automatiquement')
      }
    } else {
      toast.success(orderStatusLabel(newStatus))
    }
  }

  async function addDelay(orderId, minutes) {
    await supabase.from('order_notes').insert({ order_id: orderId, contenu: `+${minutes} min ajoutées en cuisine` })
    toast.success(`+${minutes} min noté`)
  }

  async function signalRupture(order, productId, productNom) {
    setRuptureModal({ order, productId, productNom })
  }

  async function handleRupture(action) {
    const { order, productId } = ruptureModal
    if (action === 'refuser') {
      await supabase.from('orders').update({ statut: 'refusee' }).eq('id', order.id)
      await supabase.from('order_status_history').insert({ order_id: order.id, ancien_statut: order.statut, nouveau_statut: 'refusee' })
      await supabase.from('order_notes').insert({ order_id: order.id, contenu: `Refusée — rupture de stock: ${ruptureModal.productNom}` })
      toast.error('Commande refusée — rupture')
    } else if (action === 'noter') {
      await supabase.from('order_notes').insert({ order_id: order.id, contenu: `Rupture stock signalée: ${ruptureModal.productNom}` })
      await supabase.from('stocks').update({ quantite: 0 }).eq('product_id', productId)
      toast('Rupture notée — stock mis à 0', { icon: '⚠️' })
    }
    setRuptureModal(null)
    loadOrders()
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
            <KitchenCard
              key={order.id}
              order={order}
              fullscreen={fullscreen}
              onAdvance={() => {
                const next = order.statut === 'acceptee' ? 'en_preparation' : 'prete'
                updateStatus(order, next)
              }}
              onAddDelay={min => addDelay(order.id, min)}
              onSignalRupture={(pid, pnom) => signalRupture(order, pid, pnom)}
            />
          ))}
        </div>
      )}

      {ruptureModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-orange-500 shrink-0" />
              <p className="font-bold">Rupture de stock</p>
            </div>
            <p className="text-sm text-semous-gray-text mb-2">Produit en rupture : <strong>{ruptureModal.productNom}</strong></p>
            <p className="text-sm text-semous-gray-text mb-5">Commande : <strong>{ruptureModal.order.numero}</strong></p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleRupture('noter')} className="btn-primary text-sm py-3">Marquer rupture + continuer</button>
              <button onClick={() => handleRupture('refuser')} className="border border-red-400 text-red-600 text-sm py-3 rounded-xl hover:bg-red-50">Refuser la commande</button>
              <button onClick={() => setRuptureModal(null)} className="btn-secondary text-sm py-2">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KitchenCard({ order, fullscreen, onAdvance, onAddDelay, onSignalRupture }) {
  return (
    <div className={`rounded-2xl border-2 p-5 flex flex-col gap-4
      ${fullscreen ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-semous-gray-mid'}
      ${order.statut === 'en_preparation' ? '!border-orange-400' : ''}
      ${order.statut === 'prete' ? '!border-green-500' : ''}
    `}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-lg">{order.numero}</p>
          <p className="text-xs opacity-60">{formatDate(order.created_at)} · <span className="capitalize">{order.type}</span></p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full
          ${order.statut === 'acceptee' ? 'bg-blue-100 text-blue-800' : ''}
          ${order.statut === 'en_preparation' ? 'bg-orange-100 text-orange-800' : ''}
          ${order.statut === 'prete' ? 'bg-green-100 text-green-800' : ''}
        `}>{orderStatusLabel(order.statut)}</span>
      </div>

      <div className="flex flex-col gap-2">
        {order.order_items?.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="font-bold text-lg leading-none w-7 shrink-0">{item.quantite}×</span>
            <div className="flex-1">
              <p className="font-medium">{item.products?.nom}</p>
              {item.instructions && <p className="text-xs text-orange-500 mt-0.5">⚠ {item.instructions}</p>}
              {item.options && Object.keys(item.options).length > 0 && (
                <p className="text-xs opacity-60 mt-0.5">{Object.values(item.options).join(', ')}</p>
              )}
            </div>
            {item.products?.id && (
              <button onClick={() => onSignalRupture(item.products.id, item.products.nom)}
                className="text-xs px-2 py-1 rounded border border-orange-300 text-orange-600 hover:bg-orange-50 shrink-0">Rupture</button>
            )}
          </div>
        ))}
      </div>

      <OrderTimer createdAt={order.created_at} />

      <div className="flex flex-wrap gap-2 pt-2 border-t border-current/10">
        {order.statut !== 'prete' && (
          <button onClick={onAdvance} className={`text-xs py-2 flex-1 rounded-xl font-semibold ${order.statut === 'acceptee' ? 'btn-primary' : 'btn-green'}`}>
            {order.statut === 'acceptee' ? 'En préparation' : <><Check size={14} className="inline mr-1" />Prête</>}
          </button>
        )}
        {[10, 20, 30].map(min => (
          <button key={min} onClick={() => onAddDelay(min)} className="text-xs px-2 py-2 rounded-lg border border-current/20 hover:bg-black/5">+{min}m</button>
        ))}
        <button onClick={() => {
          supabase.from('orders').select('*, order_items(*, products(nom)), addresses(*)').eq('id', order.id).single()
            .then(({ data }) => { if (data) printTicket(data, data.order_items) })
        }} className="text-xs px-2 py-2 rounded-lg border border-current/20 hover:bg-black/5"><Printer size={12} /></button>
      </div>
    </div>
  )
}

function OrderTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const calc = () => setElapsed(Math.floor((Date.now() - new Date(createdAt)) / 60000))
    calc()
    const interval = setInterval(calc, 30000)
    return () => clearInterval(interval)
  }, [createdAt])
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${elapsed > 15 ? 'text-red-500' : elapsed > 10 ? 'text-orange-500' : 'text-green-600'}`}>
      <Clock size={12} />{elapsed} min
    </div>
  )
}
