import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/format'
import { Plus, Pencil, Eye, EyeOff, Loader2, X, Check, FolderPlus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Products() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [editCat, setEditCat] = useState(null)

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

  async function addCategory() {
    if (!newCatName.trim()) return
    const slug = newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const ordre = (categories[categories.length - 1]?.ordre || 0) + 1
    const { data, error } = await supabase.from('product_categories').insert({ nom: newCatName, slug, ordre, visible: true }).select().single()
    if (error) { toast.error('Erreur'); return }
    setCategories(prev => [...prev, data])
    setNewCatName('')
    setAddingCat(false)
    toast.success('Catégorie créée')
  }

  async function renameCategory(id, nom) {
    await supabase.from('product_categories').update({ nom }).eq('id', id)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, nom } : c))
    setEditCat(null)
    toast.success('Catégorie renommée')
  }

  async function deleteCategory(id) {
    const prods = products.filter(p => p.category_id === id)
    if (prods.length > 0) { toast.error(`Impossible : ${prods.length} produit(s) dans cette catégorie`); return }
    if (!confirm('Supprimer cette catégorie vide ?')) return
    await supabase.from('product_categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success('Catégorie supprimée')
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  const uncategorized = products.filter(p => !p.category_id || !categories.find(c => c.id === p.category_id))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Produits &amp; Carte</h1>
        <div className="flex gap-2">
          <button onClick={() => setAddingCat(v => !v)} className="btn-secondary flex items-center gap-2 text-sm"><FolderPlus size={14} />Catégorie</button>
          <button onClick={() => { setEditProduct(null); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14} />Nouveau produit</button>
        </div>
      </div>

      {addingCat && (
        <div className="card p-4 mb-6 flex items-center gap-3">
          <input autoFocus className="input-field flex-1" placeholder="Nom de la catégorie..."
            value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAddingCat(false) }} />
          <button onClick={addCategory} className="btn-primary px-4"><Check size={16} /></button>
          <button onClick={() => setAddingCat(false)} className="btn-secondary px-3"><X size={16} /></button>
        </div>
      )}

      {categories.map(cat => {
        const catProducts = products.filter(p => p.category_id === cat.id)
        return (
          <div key={cat.id} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              {editCat === cat.id ? (
                <form onSubmit={e => { e.preventDefault(); renameCategory(cat.id, e.target.nom.value) }} className="flex items-center gap-2 flex-1">
                  <input name="nom" autoFocus defaultValue={cat.nom} className="input-field flex-1 py-1.5 text-sm" />
                  <button type="submit" className="btn-primary text-xs py-1.5 px-3"><Check size={12} /></button>
                  <button type="button" onClick={() => setEditCat(null)} className="btn-secondary text-xs py-1.5 px-2"><X size={12} /></button>
                </form>
              ) : (
                <>
                  <h2 className="font-semibold text-lg">{cat.nom}</h2>
                  <span className="text-xs text-semous-gray-text">({catProducts.length})</span>
                  <button onClick={() => setEditCat(cat.id)} className="text-semous-gray-text hover:text-semous-black ml-1"><Pencil size={13} /></button>
                  {catProducts.length === 0 && <button onClick={() => deleteCategory(cat.id)} className="text-semous-gray-text hover:text-red-600"><Trash2 size={13} /></button>}
                </>
              )}
            </div>
            {catProducts.length === 0 && <p className="text-sm text-semous-gray-text italic px-2">Catégorie vide</p>}
            <div className="flex flex-col gap-2">
              {catProducts.map(product => (
                <ProductRow key={product.id} product={product}
                  onToggleVisible={() => toggleVisible(product)}
                  onToggleDisponible={() => toggleDisponible(product)}
                  onEdit={() => { setEditProduct(product); setShowForm(true) }} />
              ))}
            </div>
          </div>
        )
      })}

      {uncategorized.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-3 text-semous-gray-text">Sans catégorie</h2>
          <div className="flex flex-col gap-2">
            {uncategorized.map(product => (
              <ProductRow key={product.id} product={product}
                onToggleVisible={() => toggleVisible(product)}
                onToggleDisponible={() => toggleDisponible(product)}
                onEdit={() => { setEditProduct(product); setShowForm(true) }} />
            ))}
          </div>
        </div>
      )}

      {showForm && <ProductForm product={editProduct} categories={categories} onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  )
}

function ProductRow({ product, onToggleVisible, onToggleDisponible, onEdit }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      {product.photo_url
        ? <img src={product.photo_url} alt={product.nom} className="w-14 h-14 object-cover rounded-lg shrink-0" />
        : <div className="w-14 h-14 bg-semous-gray rounded-lg flex items-center justify-center text-2xl shrink-0">🥣</div>}
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{product.nom}</p>
        <p className="text-sm text-semous-gray-text truncate">{product.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold">{formatPrice(product.prix_ttc)}</span>
        <button onClick={onToggleVisible} title={product.visible ? 'Masquer' : 'Afficher'}
          className={`p-1.5 rounded ${product.visible ? 'text-semous-black' : 'text-semous-gray-text'}`}>
          {product.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={onToggleDisponible}
          className={`text-xs px-2 py-1 rounded font-medium ${product.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {product.disponible ? 'Dispo' : 'Rupture'}
        </button>
        <button onClick={onEdit} className="p-1.5 text-semous-gray-text hover:text-semous-black"><Pencil size={16} /></button>
      </div>
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
          <div><label className="text-xs font-medium mb-1 block">Nom *</label><input className="input-field" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
          <div><label className="text-xs font-medium mb-1 block">Description</label><textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium mb-1 block">Prix TTC (EUR) *</label><input type="number" step="0.01" className="input-field" value={form.prix_ttc} onChange={e => setForm(f => ({ ...f, prix_ttc: e.target.value }))} /></div>
            <div><label className="text-xs font-medium mb-1 block">TVA (%)</label><input type="number" className="input-field" value={form.tva_percent} onChange={e => setForm(f => ({ ...f, tva_percent: e.target.value }))} /></div>
          </div>
          <div><label className="text-xs font-medium mb-1 block">URL Photo</label><input className="input-field" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." /></div>
          <div><label className="text-xs font-medium mb-1 block">Allergènes (séparés par virgule)</label><input className="input-field" value={form.allergenes} onChange={e => setForm(f => ({ ...f, allergenes: e.target.value }))} placeholder="gluten, lactose..." /></div>
          <div className="flex flex-wrap gap-4">
            {[{ key: 'visible', label: 'Visible' }, { key: 'disponible', label: 'Disponible' }, { key: 'eligible_promo', label: 'Éligible promo' }].map(opt => (
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
