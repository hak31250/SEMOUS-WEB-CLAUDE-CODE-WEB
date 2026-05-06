import { formatDate, formatPrice } from '@/utils/format'

export default function OrderTicket({ order, items }) {
  return (
    <div id="ticket-print" className="font-mono text-xs p-4 max-w-xs bg-white text-black">
      {/* Header */}
      <div className="text-center mb-3 border-b border-dashed border-black pb-3">
        <p className="font-bold text-base">SEMOUS</p>
        <p>32 av. Honoré Serres, Toulouse</p>
        <p>semous.fr</p>
      </div>

      {/* Infos commande */}
      <div className="mb-3 border-b border-dashed border-black pb-3">
        <div className="flex justify-between">
          <span>N°</span><span className="font-bold">{order.numero}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span><span>{formatDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span><span className="capitalize">{order.type}</span>
        </div>
        <div className="flex justify-between">
          <span>Paiement</span>
          <span>{order.statut_paiement || 'En attente'}</span>
        </div>
      </div>

      {/* Produits */}
      <div className="mb-3 border-b border-dashed border-black pb-3">
        {(items || []).map((item, i) => (
          <div key={i} className="mb-1.5">
            <div className="flex justify-between font-bold">
              <span>{item.quantite}× {item.products?.nom || item.nom}</span>
              <span>{formatPrice(item.prix_unitaire_ttc * item.quantite)}</span>
            </div>
            {item.options && Object.values(item.options).filter(Boolean).length > 0 && (
              <p className="pl-3 text-gray-600">
                {Object.values(item.options).filter(Boolean).map(o => o.nom).join(', ')}
              </p>
            )}
            {item.instructions && (
              <p className="pl-3 text-gray-600">⚠ {item.instructions}</p>
            )}
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="mb-3 border-b border-dashed border-black pb-3">
        <div className="flex justify-between">
          <span>Sous-total</span><span>{formatPrice(order.sous_total_ttc)}</span>
        </div>
        {order.frais_livraison > 0 && (
          <div className="flex justify-between">
            <span>Livraison</span><span>{formatPrice(order.frais_livraison)}</span>
          </div>
        )}
        {order.reduction > 0 && (
          <div className="flex justify-between">
            <span>Réduction</span><span>−{formatPrice(order.reduction)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-black mt-1 pt-1">
          <span>TOTAL TTC</span><span>{formatPrice(order.total_ttc)}</span>
        </div>
        <div className="flex justify-between text-gray-600 text-xs mt-1">
          <span>dont TVA 10%</span><span>{formatPrice(order.tva || 0)}</span>
        </div>
      </div>

      {/* Livraison */}
      {order.type === 'livraison' && order.addresses && (
        <div className="mb-3 border-b border-dashed border-black pb-3">
          <p className="font-bold">Livraison :</p>
          <p>{order.addresses.rue}</p>
          {order.addresses.complement && <p>{order.addresses.complement}</p>}
          <p>{order.addresses.code_postal} {order.addresses.ville}</p>
          {order.zone_km && <p>{order.zone_km.toFixed(1)} km</p>}
        </div>
      )}

      {/* Code promo */}
      {order.code_id && (
        <div className="mb-3 border-b border-dashed border-black pb-3">
          <p>Code promo appliqué</p>
        </div>
      )}

      {/* Note interne */}
      {order.note_interne && (
        <div className="mb-3 border-b border-dashed border-black pb-3">
          <p className="font-bold">Note :</p>
          <p>{order.note_interne}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600">
        <p>Merci pour votre commande !</p>
        <p>semous.fr</p>
      </div>
    </div>
  )
}

export function printTicket(order, items) {
  const ticketEl = document.getElementById('ticket-print')
  if (!ticketEl) return

  const printWindow = window.open('', '_blank', 'width=320,height=600')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket ${order.numero}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: monospace; font-size: 12px; }
        @media print { @page { margin: 0; size: 80mm auto; } }
      </style>
    </head>
    <body>${ticketEl.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
