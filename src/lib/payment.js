import { supabase } from './supabase'

export const PAYMENT_STATUS = {
  NON_INITIE: 'non_initie',
  EN_ATTENTE: 'en_attente',
  PREAUTORISE: 'preautorise',
  CAPTURE: 'capture',
  ECHOUE: 'echoue',
  AUTORISATION_ANNULEE: 'autorisation_annulee',
  REMBOURSEMENT_ATTENTE: 'remboursement_attente',
  REMBOURSE: 'rembourse',
  PAIEMENT_MANUEL: 'paiement_manuel',
  ACOMPTE_PAYE: 'acompte_paye',
  SOLDE_ATTENTE: 'solde_attente',
  SOLDE_PAYE: 'solde_paye',
}

export async function createPaymentRecord({ orderId, montant, methode = 'carte' }) {
  const { data, error } = await supabase.from('payments').insert({
    order_id: orderId,
    statut: PAYMENT_STATUS.NON_INITIE,
    montant,
    methode,
  }).select().single()
  if (error) throw error
  return data
}

export async function initiateOnlinePayment({ orderId, montant, metadata: _metadata = {} }) {
  await supabase.from('payments').upsert({
    order_id: orderId,
    statut: PAYMENT_STATUS.EN_ATTENTE,
    montant,
    methode: 'carte',
  }, { onConflict: 'order_id' })

  return { mode: 'manual', message: 'Paiement en ligne non encore configuré. Le paiement sera traité manuellement.' }
}

export async function validateManualPayment({ orderId, montant, methode }) {
  const { error } = await supabase.from('payments').upsert({
    order_id: orderId,
    statut: PAYMENT_STATUS.PAIEMENT_MANUEL,
    montant,
    methode,
  }, { onConflict: 'order_id' })
  if (error) throw error
}

export async function createRefund({ paymentId, orderId, montant, motif }) {
  const { data, error } = await supabase.from('refunds').insert({
    payment_id: paymentId,
    order_id: orderId,
    montant,
    motif,
    statut: 'en_attente',
  }).select().single()
  if (error) throw error

  await supabase.from('payments').update({ statut: PAYMENT_STATUS.REMBOURSEMENT_ATTENTE })
    .eq('id', paymentId)

  return data
}

export function calculateAcompte(total, pourcentage = 30) {
  return +(total * pourcentage / 100).toFixed(2)
}
