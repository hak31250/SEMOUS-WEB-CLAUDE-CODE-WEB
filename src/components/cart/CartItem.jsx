import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/format'

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()
  const optionsLabel = Object.values(item.options)
    .filter(Boolean)
    .map(o => o.nom)
    .join(', ')

  const optionsTotal = Object.values(item.options).reduce(
    (s, o) => s + (o?.prix_supplement || 0), 0
  )
  const unitPrice = item.product.prix_ttc + optionsTotal

  return (
    <div className="flex gap-3 py-3 border-b border-semous-gray-mid last:border-0">
      {/* Photo */}
      {item.product.photo_url ? (
        <img
          src={item.product.photo_url}
          alt={item.product.nom}
          className="w-16 h-16 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-16 h-16 bg-semous-gray rounded-lg shrink-0 flex items-center justify-center text-xl">
          🥣
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{item.product.nom}</p>
        {optionsLabel && (
          <p className="text-xs text-semous-gray-text mt-0.5">{optionsLabel}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              className="w-6 h-6 rounded-full border border-semous-gray-mid flex items-center justify-center hover:bg-semous-gray"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              className="w-6 h-6 rounded-full border border-semous-gray-mid flex items-center justify-center hover:bg-semous-gray"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{formatPrice(unitPrice * item.quantity)}</span>
            <button
              onClick={() => removeItem(item.key)}
              className="text-semous-gray-text hover:text-red-500 p-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
