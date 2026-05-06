export function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function orderStatusLabel(statut) {
  const map = {
    en_attente_validation: 'En attente',
    acceptee: 'Acceptée',
    en_preparation: 'En préparation',
    prete: 'Prête',
    en_livraison: 'En livraison',
    livree: 'Livrée',
    terminee: 'Terminée',
    refusee: 'Refusée',
    annulee: 'Annulée',
    litige: 'Litige',
  }
  return map[statut] || statut
}

export function orderStatusColor(statut) {
  const map = {
    en_attente_validation: 'bg-yellow-100 text-yellow-800',
    acceptee: 'bg-blue-100 text-blue-800',
    en_preparation: 'bg-orange-100 text-orange-800',
    prete: 'bg-purple-100 text-purple-800',
    en_livraison: 'bg-indigo-100 text-indigo-800',
    livree: 'bg-green-100 text-green-800',
    terminee: 'bg-gray-100 text-gray-800',
    refusee: 'bg-red-100 text-red-800',
    annulee: 'bg-red-50 text-red-700',
    litige: 'bg-red-200 text-red-900',
  }
  return map[statut] || 'bg-gray-100 text-gray-800'
}

export function paymentStatusLabel(statut) {
  const map = {
    non_initie: 'Non initié',
    en_attente: 'En attente',
    preautorise: 'Préautorisé',
    capture: 'Capturé',
    echoue: 'Échoué',
    autorisation_annulee: 'Autorisation annulée',
    remboursement_attente: 'Remboursement en attente',
    rembourse: 'Remboursé',
    paiement_manuel: 'Paiement manuel validé',
    acompte_paye: 'Acompte payé',
    solde_attente: 'Solde en attente',
    solde_paye: 'Solde payé',
  }
  return map[statut] || statut
}

export function generateOrderNumber() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `SEM-${date}-${rand}`
}
