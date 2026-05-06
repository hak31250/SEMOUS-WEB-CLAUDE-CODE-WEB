import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { MessageSquare, Send, Loader2, X, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = {
  basse: 'bg-gray-100 text-gray-600',
  normale: 'bg-blue-100 text-blue-700',
  haute: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}

const STATUS_COLORS = {
  ouvert: 'bg-green-100 text-green-700',
  en_cours: 'bg-blue-100 text-blue-700',
  resolu: 'bg-gray-100 text-gray-500',
  ferme: 'bg-gray-100 text-gray-400',
}

export default function Support() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ouvert')
  const messagesEndRef = useRef(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadTickets() }, [filterStatus])

  useEffect(() => {
    if (!selected) return
    loadMessages(selected.id)
    const channel = supabase
      .channel(`ticket-${selected.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${selected.id}` },
        payload => {
          setMessages(prev => [...prev, payload.new])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [messages])

  async function loadTickets() {
    setLoading(true)
    let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
    if (filterStatus) query = query.eq('statut', filterStatus)
    const { data } = await query
    setTickets(data || [])
    setLoading(false)
  }

  async function loadMessages(ticketId) {
    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at')
    setMessages(data || [])
  }

  async function openTicket(ticket) {
    setSelected(ticket)
    setReply('')
    // mark as read / in progress if not already
    if (ticket.statut === 'ouvert') {
      await supabase.from('support_tickets').update({ statut: 'en_cours', updated_at: new Date().toISOString() }).eq('id', ticket.id)
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, statut: 'en_cours' } : t))
      setSelected({ ...ticket, statut: 'en_cours' })
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    const { error } = await supabase.from('support_messages').insert({
      ticket_id: selected.id,
      auteur: 'admin',
      contenu: reply.trim(),
    })
    if (error) { toast.error('Erreur'); setSending(false); return }
    setReply('')
    setSending(false)
  }

  async function closeTicket(id) {
    await supabase.from('support_tickets').update({ statut: 'resolu', updated_at: new Date().toISOString() }).eq('id', id)
    setTickets(prev => prev.map(t => t.id === id ? { ...t, statut: 'resolu' } : t))
    if (selected?.id === id) setSelected(prev => ({ ...prev, statut: 'resolu' }))
    toast.success('Ticket résolu')
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Liste tickets */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Support</h1>
          <select className="input-field text-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="ouvert">Ouverts</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolus</option>
            <option value="ferme">Fermés</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>
        ) : tickets.length === 0 ? (
          <div className="card p-12 text-center text-semous-gray-text">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p>Aucun ticket</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className={`card p-4 text-left hover:shadow-md transition-shadow w-full
                  ${selected?.id === ticket.id ? 'ring-2 ring-semous-black' : ''}
                  ${ticket.statut === 'ouvert' ? 'border-green-300' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{ticket.sujet}</p>
                    <p className="text-xs text-semous-gray-text mt-0.5">
                      {ticket.email_client} · {formatDate(ticket.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`badge text-xs ${STATUS_COLORS[ticket.statut] || 'bg-gray-100 text-gray-500'}`}>
                      {ticket.statut}
                    </span>
                    <span className={`badge text-xs ${PRIORITY_COLORS[ticket.priorite] || 'bg-gray-100'}`}>
                      {ticket.priorite}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversation */}
      {selected && (
        <div className="w-96 shrink-0 hidden xl:flex flex-col">
          <div className="card flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-semous-gray-mid flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{selected.sujet}</p>
                <p className="text-xs text-semous-gray-text">{selected.email_client}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {selected.statut !== 'resolu' && (
                  <button onClick={() => closeTicket(selected.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                    <Check size={12} />Résoudre
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-semous-gray-text hover:text-semous-black">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
              {messages.length === 0 && (
                <p className="text-center text-semous-gray-text text-sm py-8">Aucun message</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.auteur === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                    ${msg.auteur === 'admin'
                      ? 'bg-semous-black text-white rounded-br-sm'
                      : 'bg-semous-gray text-semous-black rounded-bl-sm'}`}
                  >
                    <p className="leading-relaxed">{msg.contenu}</p>
                    <p className={`text-xs mt-1 ${msg.auteur === 'admin' ? 'text-white/50' : 'text-semous-gray-text'}`}>
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply */}
            {selected.statut !== 'resolu' && selected.statut !== 'ferme' && (
              <div className="p-4 border-t border-semous-gray-mid">
                <div className="flex gap-2">
                  <textarea
                    className="input-field flex-1 resize-none text-sm"
                    rows={2}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Répondre au client..."
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className="btn-primary px-3 self-end flex items-center"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            )}
            {(selected.statut === 'resolu' || selected.statut === 'ferme') && (
              <div className="p-4 border-t border-semous-gray-mid">
                <p className="text-xs text-center text-semous-gray-text flex items-center justify-center gap-1.5">
                  <AlertCircle size={12} />Ticket {selected.statut}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
