import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { formatPrice, generateOrderNumber } from '@/utils/format'
import { distanceFromRestaurant, isInDeliveryZone, getDeliveryFee } from '@/utils/delivery'
import { Truck, ShoppingBag, Loader2, MapPin, Tag, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { items, mode, setMode, sousTotal, fraisLivraison, reduction, totalFinal, applyCode, removeCode, codePromo, clearCart } = useCartStore()

  const [form, setForm] = useState({
    prenom: profile?.prenom || '',
    email: user?.email || '',
    telephone: profile?.telephone || '',
    rue: '',
    complement: '',
    code_postal: '',
    ville: 'Toulouse',
    instructions: '',
  })
  const [codeInput, setCodeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [rgpdAccepted, setRgpdAccepted] = useState(false)

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-xl mb-4">Votre panier est vide</p>
        <button onClick={() => navigate('/menu')} className="btn-primary">Voir la carte</button>
      </div>
    )
  }

  async function validateCode() {
    if (!codeInput.trim()) return
    const { data: code, error } = await supabase
      .from('codes')
      .select('*')
      .eq('code', codeInput.trim().toUpperCase())
      .eq('actif', true)
      .single()

    if (error || !code) {
      toast.error('Code promo invalide ou expiré')
      return
    }
    const now = new Date()
    if (code.date_debut && new Date(code.date_debut) > now) { toast.error('Ce code n\'est pas encore actif'); return }
    if (code.date_fin && new Date(code.date_fin) < now) { toast.error('Ce code est expiré'); return }
    if (code.limite_total && code.usage_count >= code.limite_total) { toast.error('Ce code a atteint sa limite d\'utilisation'); return }

    let redAmount = 0
    if (code.type === 'reduction_eur') redAmount = code.valeur
    if (code.type === 'reduction_pct') redAmount = (sousTotal * code.valeur) / 100
    if (code.type === 'livraison_offerte') redAmount = fraisLivraison

    applyCode(code, Math.min(redAmount, sousTotal))
    toast.success('Code promo appliqué !')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!cgvAccepted || !rgpdAccepted) { toast.error('Veuillez accepter les CGV et la politique de confidentialité'); return }
    if (mode === 'livraison' && (!form.rue || !form.code_postal)) { toast.error('Adresse de livraison obligatoire'); return }

    setLoading(true)
    try {
      let distKm = null
      if (mode === 'livraison') {
        const fullAddress = `${form.rue}, ${form.code_postal} ${form.ville}`
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(fullAddress)}&limit=1`)
        const json = await res.json()
        const feature = json.features?.[0]
        if (!feature) { setAddressError('Adresse introuvable. Vérifiez l\'adresse.'); setLoading(false); return }
        const [lng, lat] = feature.geometry.coordinates
        distKm = distanceFromRestaurant(lat, lng)
        if (!isInDeliveryZone(lat, lng)) {
          setAddressError('Votre adresse est hors zone de livraison SEMOUS (max 7 km). Choisissez le retrait ou vérifiez Uber Eats / Deliveroo.')
          setLoading(false)
          return
        }
      }

      const numero = generateOrderNumber()
      const orderPayload = {
        numero,
        user_id: user?.id || null,
        type: mode,
        statut: 'en_attente_validation',
        sous_total_ttc: sousTotal,
        frais_livraison: fraisLivraison,
        reduction,
        total_ttc: totalFinal,
        total_ht: totalFinal / 1.1,
        tva: totalFinal - totalFinal / 1.1,
        instructions: form.instructions,
        zone_km: distKm,
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        quantite: i.quantity,
        prix_unitaire_ttc: i.product.prix_ttc,
        options: i.options,
      }))
      await supabase.from('order_items').insert(orderItems)

      if (mode === 'livraison') {
        await supabase.from('addresses').insert({
          user_id: user?.id || null,
          rue: form.rue,
          complement: form.complement,
          code_postal: form.code_postal,
          ville: form.ville,
        })
      }

      if (!user) {
        await supabase.from('guest_customers').upsert({
          email: form.email,
          telephone: form.telephone,
          prenom: form.prenom,
        }, { onConflict: 'email' })
      }

      clearCart()
      navigate(`/commande/confirmation/${order.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="section-title mb-8">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Mode */}
          <div className="card p-5">
            <p className="font-semibold mb-4">Mode de livraison</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'livraison', label: 'Livraison', icon: Truck, desc: '3–5 EUR · min 15 EUR' },
                { value: 'retrait', label: 'Retrait', icon: ShoppingBag, desc: 'Gratuit · 10–15 min' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMode(opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-colors
                    ${mode === opt.value ? 'border-semous-black bg-semous-black text-white' : 'border-semous-gray-mid hover:border-semous-black'}`}
                >
                  <opt.icon size={20} className="mb-2" />
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className={`text-xs ${mode === opt.value ? 'text-gray-300' : 'text-semous-gray-text'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Infos client */}
          <div className="card p-5">
            <p className="font-semibold mb-4">Vos informations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Prénom *</label>
                <input required className="input-field" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Votre prénom" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Email *</label>
                <input required type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
              </div>
              {mode === 'livraison' && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium mb-1 block">Téléphone *</label>
                  <input required className="input-field" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="06 XX XX XX XX" />
                </div>
              )}
            </div>
          </div>

          {/* Adresse livraison */}
          {mode === 'livraison' && (
            <div className="card p-5">
              <p className="font-semibold mb-4 flex items-center gap-2"><MapPin size={16} />Adresse de livraison</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Adresse *</label>
                  <input required className="input-field" value={form.rue} onChange={e => { setForm(f => ({ ...f, rue: e.target.value })); setAddressError('') }} placeholder="N° et rue" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Complément</label>
                  <input className="input-field" value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} placeholder="Bâtiment, appartement..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Code postal *</label>
                    <input required className="input-field" value={form.code_postal} onChange={e => setForm(f => ({ ...f, code_postal: e.target.value }))} placeholder="31000" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Ville *</label>
                    <input required className="input-field" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} placeholder="Toulouse" />
                  </div>
                </div>
                {addressError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{addressError}</p>}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card p-5">
            <label className="font-semibold text-sm block mb-3">Instructions particulières</label>
            <textarea className="input-field resize-none" rows={3} value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Allergies, instructions de livraison..." />
          </div>

          {/* CGV */}
          <div className="flex flex-col gap-3">
            {[
              { key: 'cgv', state: cgvAccepted, set: setCgvAccepted, label: <>J'accepte les <a href="/legal/cgv" target="_blank" className="underline">CGV</a> de SEMOUS *</> },
              { key: 'rgpd', state: rgpdAccepted, set: setRgpdAccepted, label: <>J'accepte la <a href="/legal/confidentialite" target="_blank" className="underline">politique de confidentialité</a> *</> },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 text-sm cursor-pointer">
                <input type="checkbox" className="mt-0.5" checked={item.state} onChange={e => item.set(e.target.checked)} />
                <span className="text-semous-gray-text">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right — Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <p className="font-semibold mb-4">Récapitulatif</p>

            <div className="flex flex-col gap-2 text-sm mb-4">
              {items.map(i => (
                <div key={i.key} className="flex justify-between">
                  <span className="text-semous-gray-text">{i.product.nom} ×{i.quantity}</span>
                  <span>{formatPrice(i.product.prix_ttc * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-semous-gray-mid pt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-semous-gray-text">Sous-total</span><span>{formatPrice(sousTotal)}</span></div>
              {mode === 'livraison' && (
                <div className="flex justify-between">
                  <span className="text-semous-gray-text">Livraison</span>
                  <span>{fraisLivraison === 0 ? <span className="text-green-600">Offerte</span> : formatPrice(fraisLivraison)}</span>
                </div>
              )}
              {reduction > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span><span>−{formatPrice(reduction)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-semous-gray-mid pt-2">
                <span>Total TTC</span><span>{formatPrice(totalFinal)}</span>
              </div>
            </div>

            {/* Code promo */}
            <div className="mt-4">
              {codePromo ? (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1.5"><Tag size={14} />{codePromo.code}</span>
                  <button onClick={removeCode} className="text-green-700 hover:text-red-600"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input className="input-field text-sm flex-1" value={codeInput} onChange={e => setCodeInput(e.target.value)} placeholder="Code promo" />
                  <button type="button" onClick={validateCode} className="btn-secondary text-sm px-4 py-3">OK</button>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Traitement...</> : `Confirmer la commande`}
            </button>

            <p className="text-xs text-semous-gray-text text-center mt-3">
              Votre commande sera en attente de validation par SEMOUS.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
