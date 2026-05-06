import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Package, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('stocks')
      .select('*, products(nom, disponible, photo_url)')
      .order('quantite')
    setStocks(data || [])
    setLoading(false)
  }

  async function saveUpdate(stockId, productId) {
    const qty = parseInt(updates[stockId])
    if (isNaN(qty)) return

    await supabase.from('stocks').update({ quantite: qty, updated_at: new Date().toISOString() }).eq('id', stockId)
    await supabase.from('stock_movements').insert({ product_id: productId, type: 'correction', quantite: qty })

    if (qty === 0) {
      await supabase.from('products').update({ disponible: false }).eq('id', productId)
      toast.success('Rupture — produit marqué indisponible')
    } else {
      await supabase.from('products').update({ disponible: true }).eq('id', productId)
      toast.success('Stock mis à jour')
    }

    setUpdates(prev => { const n = { ...prev }; delete n[stockId]; return n })
    load()
  }

  const lowStock = stocks.filter(s => s.quantite <= s.seuil_alerte && s.quantite > 0)
  const outStock = stocks.filter(s => s.quantite === 0)

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stocks</h1>

      {outStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />Rupture de stock ({outStock.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {outStock.map(s => <span key={s.id} className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">{s.products?.nom}</span>)}
          </div>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-orange-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />Stock faible — seuil d'alerte ({lowStock.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(s => <span key={s.id} className="text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">{s.products?.nom} ({s.quantite})</span>)}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stocks.map(stock => (
          <div key={stock.id} className={`card p-4 flex items-center gap-4 ${stock.quantite === 0 ? 'border-red-200 bg-red-50/30' : stock.quantite <= stock.seuil_alerte ? 'border-orange-200 bg-orange-50/30' : ''}`}>
            <div className="w-12 h-12 rounded-lg bg-semous-gray flex items-center justify-center text-xl shrink-0">
              {stock.products?.photo_url ? <img src={stock.products.photo_url} className="w-full h-full object-cover rounded-lg" alt="" /> : '🥣'}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{stock.products?.nom}</p>
              <p className="text-xs text-semous-gray-text">Seuil alerte : {stock.seuil_alerte}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                className="input-field w-20 text-center"
                value={updates[stock.id] ?? stock.quantite}
                onChange={e => setUpdates(prev => ({ ...prev, [stock.id]: e.target.value }))}
              />
              {updates[stock.id] !== undefined && (
                <button onClick={() => saveUpdate(stock.id, stock.products_id || stock.product_id)} className="btn-primary text-sm py-2 px-3 flex items-center gap-1">
                  <Save size={14} />
                </button>
              )}
              <span className={`badge ${stock.quantite === 0 ? 'bg-red-100 text-red-700' : stock.quantite <= stock.seuil_alerte ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {stock.quantite === 0 ? 'Rupture' : stock.quantite <= stock.seuil_alerte ? 'Faible' : 'OK'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
