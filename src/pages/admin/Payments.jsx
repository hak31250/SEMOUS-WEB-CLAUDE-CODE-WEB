import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice, paymentStatusLabel } from '@/utils/format'
import { CreditCard, Loader2 } from 'lucide-react'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payments').select('*, orders(numero, total_ttc, type)').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setPayments(data || []); setLoading(false) })
  }, [])

  const statusColor = {
    capture: 'bg-green-100 text-green-700',
    preautorise: 'bg-blue-100 text-blue-800',
    en_attente: 'bg-yellow-100 text-yellow-800',
    echoue: 'bg-red-100 text-red-700',
    rembourse: 'bg-purple-100 text-purple-700',
    autorisation_annulee: 'bg-gray-100 text-gray-600',
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Paiements</h1>
      <div className="flex flex-col gap-3">
        {payments.map(payment => (
          <div key={payment.id} className="card p-4 flex items-center gap-4">
            <CreditCard size={20} className="text-semous-gray-text shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">{payment.orders?.numero}</p>
              <p className="text-xs text-semous-gray-text">{payment.methode} · {formatDate(payment.created_at)}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">{formatPrice(payment.montant)}</span>
              <span className={`badge ${statusColor[payment.statut] || 'bg-gray-100 text-gray-600'}`}>
                {paymentStatusLabel(payment.statut)}
              </span>
            </div>
          </div>
        ))}
        {payments.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucun paiement enregistré</p>}
      </div>
    </div>
  )
}
