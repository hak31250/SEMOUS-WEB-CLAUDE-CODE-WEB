import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/format'
import ProductModal from './ProductModal'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const [modalOpen, setModalOpen] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  function handleQuickAdd() {
    if (product.product_options?.length) {
      setModalOpen(true)
      return
    }
    addItem(product)
    toast.success(`${product.nom} ajouté au panier`)
  }

  if (!product.visible || !product.disponible) return null

  return (
    <>
      <div className="card overflow-hidden group cursor-pointer hover:shadow-md transition-shadow" onClick={() => setModalOpen(true)}>
        <div className="relative">
          {product.photo_url ? (
            <img
              src={product.photo_url}
              alt={product.nom}
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-44 bg-semous-gray flex items-center justify-center text-4xl">
              🥣
            </div>
          )}
          {!product.disponible && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-semous-gray-text">Indisponible</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1">{product.nom}</h3>
          {product.description && (
            <p className="text-xs text-semous-gray-text line-clamp-2 mb-3">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-bold">{formatPrice(product.prix_ttc)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleQuickAdd() }}
              disabled={!product.disponible}
              className="w-8 h-8 rounded-full bg-semous-black text-white flex items-center justify-center hover:bg-semous-green transition-colors disabled:opacity-40"
              aria-label="Ajouter"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
