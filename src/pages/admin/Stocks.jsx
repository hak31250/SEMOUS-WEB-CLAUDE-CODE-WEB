import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, Loader2, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('stocks')
      .select('*, products(id, nom, disponible, photo_url)')
      .order('quantite')
    setStocks(data || [])
    setUpdates({})
    setLoading(false)
  }

  async function saveUpdate(stock) {
    const qty = parseInt(updates[stock.id])
    if (isNaN(qty) || qty < 0) return

    await supabase.from('stocks').update({ quantite: qty, updated_at: new Date().toISOString() }).eq('id', stock.id)
    await supabase.from('stock_movements').insert({
      product_id: stock.products.id,
      type: qty === 0 ? 'rupture' : 'correction',
      quantite: qty,
    })

    if (qty === 0) {
      await supabase.from('products').update({ disponible: false }).eq('id', stock.products.id)
      toast.success(`${stock.products.nom} — Rupture, produit indisponible`)
    } else {
      await supabase.from('products').update({ disponible: true }).eq('id', stock.products.id)
      toast.success(`${stock.products.nom} — Stock mis à jour (${qty})`)
    }

    load()
  }

  const lowStock = stocks.filter(s => s.quantite > 0 && s.quantite <= s.seuil_alerte)
  const outStock = stocks.filter(s => s.quantite === 0)

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Stocks</h1>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <RefreshCw size={14} />Actualiser
        </button>
      </div>

      {outStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="font-semibold text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />Rupture de stock ({outStock.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {outStock.map(s => (
              <span key={s.id} className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">{s.products?.nom}</span>
            ))}
          </div>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-orange-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />Stock faible — seuil d&apos;alerte ({lowStock.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(s => (
              <span key={s.id} className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                {s.products?.nom} ({s.quantite})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {stocks.map(stock => (
          <div key={stock.id} className={`card p-4 flex items-center gap-4
            ${stock.quantite === 0 ? 'border-red-200 bg-red-50/40' : stock.quantite <= stock.seuil_alerte ? 'border-orange-200 bg-orange-50/30' : ''}`}>

            <div className="w-12 h-12 rounded-lg bg-semous-gray flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {stock.products?.photo_url
                ? <img src={stock.products.photo_url} className="w-full h-full object-cover" alt="" />
                : '🥣'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{stock.products?.nom}</p>
              <p className="text-xs text-semous-gray-text">Seuil alerte : {stock.seuil_alerte} unités</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                className="input-field w-20 text-center text-sm"
                value={updates[stock.id] ?? stock.quantite}
                onChange={e => setUpdates(prev => ({ ...prev, [stock.id]: e.target.value }))}
              />

              {updates[stock.id] !== undefined && String(updates[stock.id]) !== String(stock.quantite) && (
                <button
                  onClick={() => saveUpdate(stock)}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Save size={13} />
                </button>
              )}

              <span className={`badge shrink-0 ${
                stock.quantite === 0 ? 'bg-red-100 text-red-700'
                : stock.quantite <= stock.seuil_alerte ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
              }`}>
                {stock.quantite === 0 ? 'Rupture' : stock.quantite <= stock.seuil_alerte ? 'Faible' : 'OK'}
              </span>
            </div>
          </div>
        ))}

        {stocks.length === 0 && (
          <div className="card p-10 text-center text-semous-gray-text">
            <p className="mb-2">Aucun stock configuré</p>
            <p className="text-xs">Les stocks sont créés automatiquement à l&apos;ajout d&apos;un produit.</p>
          </div>
        )}
      </div>
    </div>
  )
}
