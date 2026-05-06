import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/format'
import { Plus, Pencil, Eye, EyeOff, Loader2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Products() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('product_categories').select('*').order('ordre'),
      supabase.from('products').select('*, product_categories(nom)').order('ordre'),
    ])
    setCategories(cats || [])
    setProducts(prods || [])
    setLoading(false)
  }

  async function toggleVisible(product) {
    await supabase.from('products').update({ visible: !product.visible }).eq('id', product.id)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, visible: !p.visible } : p))
  }

  async function toggleDisponible(product) {
    await supabase.from('products').update({ disponible: !product.disponible }).eq('id', product.id)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, disponible: !p.disponible } : p))
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produits & Carte</h1>
        <button onClick={() => { setEditProduct(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Nouveau produit
        </button>
      </div>

      {categories.map(cat => {
        const catProducts = products.filter(p => p.category_id === cat.id)
        if (!catProducts.length) return null
        return (
          <div key={cat.id} className="mb-8">
            <h2 className="font-semibold text-lg mb-3">{cat.nom}</h2>
            <div className="flex flex-col gap-2">
              {catProducts.map(product => (
                <div key={product.id} className="card p-4 flex items-center gap-4">
                  {product.photo_url ? (
                    <img src={product.photo_url} alt={product.nom} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-semous-gray rounded-lg flex items-center justify-center text-2xl shrink-0">🥣</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{product.nom}</p>
                    <p className="text-sm text-semous-gray-text truncate">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{formatPrice(product.prix_ttc)}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleVisible(product)} title={product.visible ? 'Masquer' : 'Afficher'} className={`p-1.5 rounded ${product.visible ? 'text-semous-black' : 'text-semous-gray-text'}`}>
                        {product.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => toggleDisponible(product)}
                        className={`text-xs px-2 py-1 rounded font-medium ${product.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {product.disponible ? 'Disponible' : 'Rupture'}
                      </button>
                      <button onClick={() => { setEditProduct(product); setShowForm(true) }} className="p-1.5 text-semous-gray-text hover:text-semous-black">
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: product?.nom || '',
    description: product?.description || '',
    prix_ttc: product?.prix_ttc || '',
    tva_percent: product?.tva_percent || 10,
    category_id: product?.category_id || categories[0]?.id || '',
    visible: product?.visible ?? true,
    disponible: product?.disponible ?? true,
    eligible_promo: product?.eligible_promo ?? true,
    allergenes: product?.allergenes?.join(', ') || '',
    photo_url: product?.photo_url || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      prix_ttc: parseFloat(form.prix_ttc),
      tva_percent: parseFloat(form.tva_percent),
      allergenes: form.allergenes ? form.allergenes.split(',').map(s => s.trim()) : [],
    }
    const { error } = product?.id
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)
    setSaving(false)
    if (error) { toast.error('Erreur lors de la sauvegarde'); return }
    toast.success('Produit sauvegardé')
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-semous-gray-mid">
          <h2 className="font-bold text-lg">{product ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Catégorie *</label>
            <select className="input-field" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Nom *</label>
            <input className="input-field" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Prix TTC (EUR) *</label>
              <input type="number" step="0.01" className="input-field" value={form.prix_ttc} onChange={e => setForm(f => ({ ...f, prix_ttc: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">TVA (%)</label>
              <input type="number" className="input-field" value={form.tva_percent} onChange={e => setForm(f => ({ ...f, tva_percent: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">URL Photo</label>
            <input className="input-field" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Allergènes (séparés par virgule)</label>
            <input className="input-field" value={form.allergenes} onChange={e => setForm(f => ({ ...f, allergenes: e.target.value }))} placeholder="gluten, lactose..." />
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'visible', label: 'Visible' },
              { key: 'disponible', label: 'Disponible' },
              { key: 'eligible_promo', label: 'Éligible promo' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form[opt.key]} onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-semous-gray-mid flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
