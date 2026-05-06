/**
 * SEMOUS — Architecture paiement
 *
 * Le prestataire final reste à choisir.
 * Ce module expose une interface unifiée prête à connecter :
 * Stripe, SumUp, PayPlug, Lyra, ou tout autre prestataire compatible.
 *
 * En V1 : les paiements sont enregistrés manuellement ou via TPE.
 * Ce service est prêt à être branché côté Supabase Edge Functions.
 */

import { supabase } from './supabase'

// Statuts paiement
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

/**
 * Crée un enregistrement paiement pour une commande.
 * À appeler après création de la commande.
 */
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

/**
 * Initie un paiement en ligne.
 * En production : appeler la Supabase Edge Function `create-payment-intent`
 * qui communique avec le prestataire (Stripe, PayPlug, etc.)
 */
export async function initiateOnlinePayment({ orderId, montant, metadata = {} }) {
  // TODO: remplacer par appel à la Edge Function quand prestataire choisi
  // const { data, error } = await supabase.functions.invoke('create-payment-intent', {
  //   body: { order_id: orderId, amount: Math.round(montant * 100), currency: 'eur', metadata }
  // })
  // return data // { client_secret, payment_intent_id }

  // Placeholder V1 — paiement manuel
  await supabase.from('payments').upsert({
    order_id: orderId,
    statut: PAYMENT_STATUS.EN_ATTENTE,
    montant,
    methode: 'carte',
  }, { onConflict: 'order_id' })

  return { mode: 'manual', message: 'Paiement en ligne non encore configuré. Le paiement sera traité manuellement.' }
}

/**
 * Valide manuellement un paiement (TPE, virement, titre-restaurant).
 */
export async function validateManualPayment({ orderId, montant, methode }) {
  const { error } = await supabase.from('payments').upsert({
    order_id: orderId,
    statut: PAYMENT_STATUS.PAIEMENT_MANUEL,
    montant,
    methode,
  }, { onConflict: 'order_id' })
  if (error) throw error
}

/**
 * Déclenche un remboursement.
 * En production : appeler la Edge Function `create-refund`
 */
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

/**
 * Calcule l'acompte entreprise (30% par défaut).
 */
export function calculateAcompte(total, pourcentage = 30) {
  return +(total * pourcentage / 100).toFixed(2)
}
