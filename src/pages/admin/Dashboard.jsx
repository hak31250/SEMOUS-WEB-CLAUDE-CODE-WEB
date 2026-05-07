import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor } from '@/utils/format'
import { ShoppingBag, TrendingUp, Clock, AlertCircle, Volume2, VolumeX, Loader2, Printer, MessageSquare, X, Check } from 'lucide-react'
import OrderTicket, { printTicket } from '@/components/admin/OrderTicket'
import { playNotificationBeep } from '@/utils/sound'
import toast from 'react-hot-toast'

const ACTIVE_STATUSES = ['en_attente_validation', 'acceptee', 'en_preparation', 'prete', 'en_livraison']
const NEXT_STATUS = {
  en_attente_validation: 'acceptee',
  acceptee: 'en_preparation',
  en_preparation: 'prete',
  prete: 'en_livraison',
  en_livraison: 'livree',
}
const NEXT_LABEL = {
  en_attente_validation: 'Accepter',
  acceptee: 'En préparation',
  en_preparation: 'Prête',
  prete: 'En livraison',
  en_livraison: 'Livrée',
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ ca: 0, count: 0, panier: 0 })
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundSrc, setSoundSrc] = useState('/sounds/notification.mp3')
  const [noteModal, setNoteModal] = useState(null)
  const [printOrder, setPrintOrder] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    loadAll()
    supabase.from('settings').select('cle,valeur').in('cle', ['sonnerie_active', 'sonnerie_fichier'])
      .then(({ data }) => {
        data?.forEach(s => {
          if (s.cle === 'sonnerie_active') setSoundEnabled(s.valeur === 'true')
          if (s.cle === 'sonnerie_fichier' && s.valeur) setSoundSrc(s.valeur)
        })
      })

    const channel = supabase.channel('dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => [payload.new, ...prev])
        if (soundEnabled) {
          audioRef.current?.play().catch(() => playNotificationBeep())
        }
        toast('🛎 Nouvelle commande reçue !', { duration: 5000 })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
          .filter(o => ACTIVE_STATUSES.includes(o.statut)))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [soundEnabled])

  async function loadAll() {
    setLoading(true)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const [{ data: active }, { data: today_orders }] = await Promise.all([
      supabase.from('orders').select('*, order_items(quantite, prix_unitaire_ttc, options, instructions, products(nom))')
        .in('statut', ACTIVE_STATUSES).order('created_at'),
      supabase.from('orders').select('total_ttc')
        .gte('created_at', today.toISOString()).in('statut', ['terminee', 'livree']),
    ])
    setOrders(active || [])
    const ca = (today_orders || []).reduce((s, o) => s + (o.total_ttc || 0), 0)
    setStats({ ca, count: today_orders?.length || 0, panier: today_orders?.length ? ca / today_orders.length : 0 })
    setLoading(false)
  }

  async function updateStatus(order, newStatus) {
    await supabase.from('orders').update({ statut: newStatus, updated_at: new Date().toISOString() }).eq('id', order.id)
    await supabase.from('order_status_history').insert({ order_id: order.id, ancien_statut: order.statut, nouveau_statut: newStatus })
    if (newStatus === 'acceptee') {
      const { data } = await supabase.from('orders')
        .select('*, order_items(*, products(nom)), addresses(*)')
        .eq('id', order.id).single()
      if (data) setPrintOrder(data)
    }
    toast.success(orderStatusLabel(newStatus))
  }

  async function saveNote(orderId, note) {
    await supabase.from('orders').update({ note_interne: note }).eq('id', orderId)
    await supabase.from('order_notes').insert({ order_id: orderId, contenu: note })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, note_interne: note } : o))
    setNoteModal(null)
    toast.success('Note sauvegardée')
  }

  async function toggleSonnerie() {
    const next = !soundEnabled
    setSoundEnabled(next)
    await supabase.from('settings').upsert({ cle: 'sonnerie_active', valeur: next ? 'true' : 'false' }, { onConflict: 'cle' })
  }

  return (
    <div>
      <audio ref={audioRef} src={soundSrc} preload="auto" />

      {printOrder && (
        <div className="fixed -left-[9999px]">
          <OrderTicket order={printOrder} items={printOrder.order_items} />
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => audioRef.current?.play().catch(() => playNotificationBeep())}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-semous-gray-mid hover:bg-semous-gray">
            <Volume2 size={14} />Tester
          </button>
          <button onClick={toggleSonnerie}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${soundEnabled ? 'bg-semous-black text-white border-semous-black' : 'border-semous-gray-mid text-semous-gray-text'}`}>
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundEnabled ? 'Son ON' : 'Son OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'CA du jour', value: formatPrice(stats.ca), color: 'text-green-600' },
          { icon: ShoppingBag, label: 'Commandes du jour', value: stats.count, color: 'text-blue-600' },
          { icon: Clock, label: 'Panier moyen', value: formatPrice(stats.panier), color: 'text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <s.icon size={20} className={`mb-2 ${s.color}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-semous-gray-text mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Commandes actives</h2>
        <span className="badge bg-semous-black text-white">{orders.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-semous-gray-text">
          <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
          <p>Aucune commande active</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map(order => (
            <DashboardOrderCard
              key={order.id}
              order={order}
              onAdvance={() => NEXT_STATUS[order.statut] && updateStatus(order, NEXT_STATUS[order.statut])}
              onRefuse={() => updateStatus(order, 'refusee')}
              onNote={() => setNoteModal(order)}
              onPrint={() => {
                supabase.from('orders').select('*, order_items(*, products(nom)), addresses(*)').eq('id', order.id).single()
                  .then(({ data }) => { if (data) { setPrintOrder(data); setTimeout(() => printTicket(data, data.order_items), 200) } })
              }}
            />
          ))}
        </div>
      )}

      {noteModal && (
        <NoteModal
          order={noteModal}
          onSave={note => saveNote(noteModal.id, note)}
          onClose={() => setNoteModal(null)}
        />
      )}

      {printOrder && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-xl border border-semous-gray-mid p-4 z-50 max-w-xs">
          <p className="font-semibold text-sm mb-3 flex items-center gap-2"><Printer size={16} />Imprimer le ticket ?</p>
          <p className="text-xs text-semous-gray-text mb-3">{printOrder.numero}</p>
          <div className="flex gap-2">
            <button onClick={() => printTicket(printOrder, printOrder.order_items)} className="btn-primary text-xs py-2 flex-1 flex items-center justify-center gap-1">
              <Printer size={12} />Imprimer
            </button>
            <button onClick={() => setPrintOrder(null)} className="btn-secondary text-xs py-2 px-3">Ignorer</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardOrderCard({ order, onAdvance, onRefuse, onNote, onPrint }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - new Date(order.created_at)) / 60000))
  useEffect(() => {
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - new Date(order.created_at)) / 60000)), 30000)
    return () => clearInterval(i)
  }, [order.created_at])

  const isWaiting = order.statut === 'en_attente_validation'
  const isLate = isWaiting && elapsed >= 3
  const isWarning = isWaiting && elapsed >= 1 && !isLate

  return (
    <div className={`card p-4 flex flex-col gap-3
      ${isLate ? 'border-red-400 bg-red-50/40 animate-pulse' : isWarning ? 'border-orange-300 bg-orange-50/30' : ''}`}>
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

      <div className="text-xs text-semous-gray-text flex flex-col gap-0.5">
        {order.order_items?.slice(0, 3).map((item, i) => (
          <span key={i}>{item.quantite}× {item.products?.nom}</span>
        ))}
        {(order.order_items?.length || 0) > 3 && <span>+{order.order_items.length - 3} autres</span>}
      </div>

      {isWaiting && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${isLate ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-semous-gray-text'}`}>
          <AlertCircle size={12} />
          {isLate ? `⚠ En attente depuis ${elapsed} min — validation en retard` : isWarning ? `Attente: ${elapsed} min` : `Reçue il y a ${elapsed} min`}
        </div>
      )}

      {order.note_interne && (
        <p className="text-xs bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-yellow-800">
          📝 {order.note_interne}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-semous-gray-mid pt-2">
        <span className="font-bold text-sm">{formatPrice(order.total_ttc)}</span>
        {order.zone_km && <span className="text-xs text-semous-gray-text">{order.zone_km.toFixed(1)} km</span>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {NEXT_STATUS[order.statut] && (
          <button onClick={onAdvance} className="btn-primary text-xs py-2 flex-1">{NEXT_LABEL[order.statut]}</button>
        )}
        {isWaiting && (
          <button onClick={onRefuse} className="border border-red-400 text-red-600 text-xs py-2 px-3 rounded-lg hover:bg-red-50">Refuser</button>
        )}
        <button onClick={onNote} title="Note interne" className="p-2 rounded-lg border border-semous-gray-mid hover:bg-semous-gray">
          <MessageSquare size={13} />
        </button>
        <button onClick={onPrint} title="Imprimer ticket" className="p-2 rounded-lg border border-semous-gray-mid hover:bg-semous-gray">
          <Printer size={13} />
        </button>
      </div>
    </div>
  )
}

function NoteModal({ order, onSave, onClose }) {
  const [note, setNote] = useState(order.note_interne || '')
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold">Note interne — {order.numero}</p>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <textarea className="input-field resize-none w-full" rows={4} value={note}
          onChange={e => setNote(e.target.value)} placeholder="Note visible uniquement par l'équipe SEMOUS..." autoFocus />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={() => onSave(note)} className="btn-primary flex-1 flex items-center justify-center gap-1">
            <Check size={14} />Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
