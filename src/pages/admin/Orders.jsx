import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { Search, Printer, MessageSquare, Clock, X, Check, Loader2, ChevronDown } from 'lucide-react'
import { printTicket } from '@/components/admin/OrderTicket'
import toast from 'react-hot-toast'

const ALL_STATUSES = ['en_attente_validation', 'acceptee', 'en_preparation', 'prete', 'en_livraison', 'livree', 'terminee', 'refusee', 'annulee', 'litige']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailOrder, setDetailOrder] = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [filterStatus])

  async function load() {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, order_items(quantite, prix_unitaire_ttc, products(nom))')
      .order('created_at', { ascending: false })
      .limit(200)
    if (filterStatus) query = query.eq('statut', filterStatus)
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }

  async function openDetail(order) {
    setSelectedOrder(order)
    const [{ data: full }, { data: history }, { data: notes }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*, products(nom)), addresses(*)').eq('id', order.id).single(),
      supabase.from('order_status_history').select('*').eq('order_id', order.id).order('created_at'),
      supabase.from('order_notes').select('*').eq('order_id', order.id).order('created_at'),
    ])
    setDetailOrder({ ...full, history: history || [], notes: notes || [] })
  }

  async function updateStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId)
    await supabase.from('orders').update({ statut: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    await supabase.from('order_status_history').insert({ order_id: orderId, ancien_statut: order?.statut, nouveau_statut: newStatus })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: newStatus } : o))
    if (detailOrder?.id === orderId) {
      setDetailOrder(prev => ({
        ...prev,
        statut: newStatus,
        history: [...prev.history, { ancien_statut: order?.statut, nouveau_statut: newStatus, created_at: new Date().toISOString() }],
      }))
    }
    toast.success(orderStatusLabel(newStatus))
  }

  async function saveNote(orderId, note) {
    await supabase.from('orders').update({ note_interne: note }).eq('id', orderId)
    await supabase.from('order_notes').insert({ order_id: orderId, contenu: note })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, note_interne: note } : o))
    if (detailOrder?.id === orderId) {
      setDetailOrder(prev => ({
        ...prev,
        note_interne: note,
        notes: [...prev.notes, { contenu: note, created_at: new Date().toISOString() }],
      }))
    }
    toast.success('Note sauvegardée')
  }

  function handlePrint(order) {
    const src = detailOrder?.id === order.id ? detailOrder : null
    if (src && src.order_items) {
      printTicket(src, src.order_items)
    } else {
      supabase.from('orders').select('*, order_items(*, products(nom)), addresses(*)').eq('id', order.id).single()
        .then(({ data }) => { if (data) printTicket(data, data.order_items) })
    }
  }

  const filtered = orders.filter(o =>
    !search || o.numero?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-6 h-full">
      {/* Liste */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
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
                onClick={() => openDetail(order)}
                className={`card p-4 text-left hover:shadow-md transition-shadow w-full
                  ${selectedOrder?.id === order.id ? 'ring-2 ring-semous-black' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{order.numero}</p>
                    <p className="text-xs text-semous-gray-text">{formatDate(order.created_at)} · <span className="capitalize">{order.type}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{formatPrice(order.total_ttc)}</span>
                    <span className={`badge ${orderStatusColor(order.statut)}`}>{orderStatusLabel(order.statut)}</span>
                  </div>
                </div>
                {order.note_interne && (
                  <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 rounded px-2 py-0.5 text-left">
                    📝 {order.note_interne}
                  </p>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-12 text-semous-gray-text">Aucune commande trouvée</p>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {detailOrder && (
        <div className="w-96 shrink-0 hidden xl:block">
          <OrderDetail
            order={detailOrder}
            onUpdateStatus={updateStatus}
            onSaveNote={saveNote}
            onPrint={() => handlePrint(detailOrder)}
            onClose={() => { setDetailOrder(null); setSelectedOrder(null) }}
          />
        </div>
      )}
    </div>
  )
}

function OrderDetail({ order, onUpdateStatus, onSaveNote, onPrint, onClose }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState(order.note_interne || '')
  const [historyOpen, setHistoryOpen] = useState(false)

  const statusActions = {
    en_attente_validation: [
      { label: 'Accepter', status: 'acceptee', style: 'btn-primary' },
      { label: 'Refuser', status: 'refusee', style: 'border border-red-400 text-red-600 text-sm py-2 px-4 rounded-lg hover:bg-red-50' },
    ],
    acceptee: [{ label: 'En préparation', status: 'en_preparation', style: 'btn-primary' }],
    en_preparation: [{ label: 'Prête', status: 'prete', style: 'btn-green' }],
    prete: [{ label: 'En livraison / Retrait', status: 'en_livraison', style: 'btn-primary' }],
    en_livraison: [{ label: 'Livrée', status: 'livree', style: 'btn-green' }],
    livree: [{ label: 'Terminée', status: 'terminee', style: 'btn-primary' }],
  }

  const addr = order.addresses
  const addressStr = addr ? `${addr.rue}${addr.complement ? ', ' + addr.complement : ''}, ${addr.code_postal} ${addr.ville}` : null

  return (
    <div className="card p-5 sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold">{order.numero}</p>
        <div className="flex gap-2">
          <button onClick={onPrint} title="Imprimer ticket" className="p-1.5 text-semous-gray-text hover:text-semous-black">
            <Printer size={16} />
          </button>
          <button onClick={() => setNoteOpen(n => !n)} title="Note interne" className={`p-1.5 rounded ${noteOpen ? 'bg-yellow-100 text-yellow-700' : 'text-semous-gray-text hover:text-semous-black'}`}>
            <MessageSquare size={16} />
          </button>
          <button onClick={onClose} className="p-1.5 text-semous-gray-text hover:text-semous-black">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2 text-sm mb-4">
        <div className="flex justify-between items-center">
          <span className="text-semous-gray-text">Statut</span>
          <span className={`badge ${orderStatusColor(order.statut)}`}>{orderStatusLabel(order.statut)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Mode</span>
          <span className="capitalize font-medium">{order.type}</span>
        </div>
        {order.mode_paiement && (
          <div className="flex justify-between">
            <span className="text-semous-gray-text">Paiement</span>
            <span className="capitalize">{order.mode_paiement}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Total TTC</span>
          <span className="font-bold">{formatPrice(order.total_ttc)}</span>
        </div>
        {order.frais_livraison > 0 && (
          <div className="flex justify-between">
            <span className="text-semous-gray-text">Livraison</span>
            <span>{formatPrice(order.frais_livraison)}</span>
          </div>
        )}
        {order.reduction > 0 && (
          <div className="flex justify-between">
            <span className="text-semous-gray-text">Réduction</span>
            <span className="text-green-600">-{formatPrice(order.reduction)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-semous-gray-text">Date</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        {addressStr && (
          <div className="flex justify-between gap-2">
            <span className="text-semous-gray-text shrink-0">Adresse</span>
            <span className="text-right text-xs">{addressStr}</span>
          </div>
        )}
      </div>

      {/* Note interne */}
      {noteOpen && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs font-semibold text-yellow-800 mb-2">Note interne</p>
          <textarea
            className="w-full text-xs bg-white border border-yellow-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note visible équipe uniquement..."
          />
          <button
            onClick={() => { onSaveNote(order.id, note); setNoteOpen(false) }}
            className="mt-2 text-xs btn-primary py-1.5 w-full flex items-center justify-center gap-1"
          >
            <Check size={12} />Sauvegarder
          </button>
        </div>
      )}

      {/* Articles */}
      <div className="border-t border-semous-gray-mid pt-4 mb-4">
        <p className="font-semibold text-sm mb-2">Articles</p>
        {order.order_items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1.5 border-b border-semous-gray last:border-0">
            <div>
              <span className="font-medium">{item.products?.nom} ×{item.quantite}</span>
              {item.instructions && <p className="text-xs text-orange-600 mt-0.5">⚠ {item.instructions}</p>}
            </div>
            <span className="shrink-0 ml-2">{formatPrice(item.prix_unitaire_ttc * item.quantite)}</span>
          </div>
        ))}
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusActions[order.statut]?.map(action => (
          <button key={action.status} onClick={() => onUpdateStatus(order.id, action.status)} className={`${action.style} text-sm py-2 px-4 flex-1`}>
            {action.label}
          </button>
        ))}
      </div>

      {/* Historique */}
      {order.history?.length > 0 && (
        <div className="border-t border-semous-gray-mid pt-4">
          <button
            onClick={() => setHistoryOpen(h => !h)}
            className="flex items-center gap-2 text-sm font-semibold w-full text-left"
          >
            <Clock size={14} />Historique ({order.history.length})
            <ChevronDown size={14} className={`ml-auto transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
          </button>
          {historyOpen && (
            <div className="mt-3 flex flex-col gap-2">
              {order.history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-semous-gray-mid shrink-0" />
                  <span className="text-semous-gray-text">{formatDate(h.created_at)}</span>
                  <span>{orderStatusLabel(h.ancien_statut)} → <strong>{orderStatusLabel(h.nouveau_statut)}</strong></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes équipe */}
      {order.notes?.length > 0 && (
        <div className="border-t border-semous-gray-mid pt-4 mt-4">
          <p className="text-sm font-semibold mb-2">Notes équipe</p>
          {order.notes.map((n, i) => (
            <div key={i} className="text-xs bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 mb-2">
              <p className="text-yellow-700">{formatDate(n.created_at)}</p>
              <p className="mt-0.5">{n.contenu}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
