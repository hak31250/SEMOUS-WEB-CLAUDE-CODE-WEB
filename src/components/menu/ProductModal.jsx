import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/format'
import toast from 'react-hot-toast'

export default function ProductModal({ product, open, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState({})
  const addItem = useCartStore(s => s.addItem)

  if (!open || !product) return null

  const optionsByType = (product.product_options || []).reduce((acc, opt) => {
    if (!acc[opt.type]) acc[opt.type] = []
    acc[opt.type].push(opt)
    return acc
  }, {})

  const optionsTotal = Object.values(selectedOptions).reduce(
    (s, o) => s + (o?.prix_supplement || 0), 0
  )
  const unitPrice = product.prix_ttc + optionsTotal

  function handleAdd() {
    addItem(product, quantity, selectedOptions)
    toast.success(`${product.nom} ajouté au panier`)
    onClose()
    setQuantity(1)
    setSelectedOptions({})
  }

  const typeLabels = {
    taille: 'Taille',
    sauce: 'Sauce',
    topping: 'Topping',
    extra: 'Extra',
    boisson: 'Boisson',
    dessert: 'Dessert',
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {product.photo_url ? (
            <div className="relative">
              <img src={product.photo_url} alt={product.nom} className="w-full h-52 object-cover rounded-t-2xl md:rounded-t-2xl" />
              <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex justify-end p-4">
              <button onClick={onClose}><X size={20} /></button>
            </div>
          )}

          <div className="p-5">
            <h2 className="font-bold text-xl mb-1">{product.nom}</h2>
            {product.description && (
              <p className="text-sm text-semous-gray-text mb-4">{product.description}</p>
            )}
            {product.allergenes?.length > 0 && (
              <p className="text-xs text-orange-600 mb-4">
                Allergènes : {product.allergenes.join(', ')}
              </p>
            )}

            {Object.entries(optionsByType).map(([type, opts]) => (
              <div key={type} className="mb-4">
                <p className="font-semibold text-sm mb-2">{typeLabels[type] || type}</p>
                <div className="flex flex-wrap gap-2">
                  {opts.filter(o => o.disponible).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOptions(prev => ({
                        ...prev,
                        [type]: prev[type]?.id === opt.id ? null : opt,
                      }))}
                      className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-colors
                        ${selectedOptions[type]?.id === opt.id
                          ? 'bg-semous-black text-white border-semous-black'
                          : 'border-semous-gray-mid text-semous-black hover:border-semous-black'
                        }`}
                    >
                      {opt.nom}
                      {opt.prix_supplement > 0 && ` +${formatPrice(opt.prix_supplement)}`}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-semous-gray-mid">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border border-semous-gray-mid flex items-center justify-center hover:bg-semous-gray"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-full border border-semous-gray-mid flex items-center justify-center hover:bg-semous-gray"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!product.disponible}
                className="btn-primary"
              >
                Ajouter — {formatPrice(unitPrice * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
