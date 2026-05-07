import { X, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore, useCartTotals, LIVRAISON_MINIMUM } from '@/store/cartStore'
import { formatPrice } from '@/utils/format'
import CartItem from './CartItem'

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const mode = useCartStore(s => s.mode)
  const { sousTotal, fraisLivraison, totalFinal, isDeliveryEligible } = useCartTotals()

  function goToCheckout() {
    onClose()
    navigate('/commande')
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="cart-slide-in fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-semous-gray-mid">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart size={20} />Mon panier
          </h2>
          <button onClick={onClose} className="p-1 text-semous-gray-text hover:text-semous-black">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingCart size={48} className="text-semous-gray-mid" />
              <p className="text-semous-gray-text text-sm">Votre panier est vide</p>
              <button onClick={onClose} className="btn-primary text-sm">Voir la carte</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map(item => <CartItem key={item.key} item={item} />)}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-semous-gray-mid px-5 py-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-semous-gray-text">Sous-total</span>
                <span>{formatPrice(sousTotal)}</span>
              </div>
              {mode === 'livraison' && (
                <div className="flex justify-between">
                  <span className="text-semous-gray-text">Livraison</span>
                  <span>{fraisLivraison === 0 ? <span className="text-green-600 font-medium">Offerte</span> : formatPrice(fraisLivraison)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-semous-gray-mid pt-2 mt-1">
                <span>Total</span>
                <span>{formatPrice(totalFinal)}</span>
              </div>
            </div>

            {mode === 'livraison' && !isDeliveryEligible && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                Minimum livraison : {formatPrice(LIVRAISON_MINIMUM)}.
                Il manque {formatPrice(LIVRAISON_MINIMUM - sousTotal)}.
              </p>
            )}

            <button
              onClick={goToCheckout}
              disabled={mode === 'livraison' && !isDeliveryEligible}
              className="btn-primary w-full text-center"
            >
              Commander — {formatPrice(totalFinal)}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
