import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/menu/ProductCard'
import { Loader2 } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

export default function Menu() {
  useSeo({
    title: 'Menu',
    description: 'Découvrez les bols SEMOUS : semoule fine, toppings généreux, sauces maison. 100% halal. Livraison à Toulouse ou retrait sur place.',
    keywords: 'menu semous, bol semoule, halal toulouse',
  })
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('product_categories').select('*').eq('visible', true).order('ordre'),
        supabase.from('products').select('*, product_options(*)').eq('visible', true).order('ordre'),
      ])
      setCategories(cats || [])
      setProducts(prods || [])
      if (cats?.length) setActiveCategory(cats[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 size={28} className="animate-spin text-semous-black" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">Notre carte</h1>

      {/* Catégories */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${activeCategory === cat.id
                  ? 'bg-semous-black text-white'
                  : 'bg-semous-gray text-semous-black hover:bg-semous-gray-mid'
                }`}
            >
              {cat.nom}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-semous-gray-text">
          <p className="text-4xl mb-3">🥣</p>
          <p>Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
