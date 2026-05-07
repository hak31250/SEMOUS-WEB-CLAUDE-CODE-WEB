import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Clock, Users, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSeo } from '@/hooks/useSeo'

export default function Enterprise() {
  useSeo({
    title: 'Commandes entreprises',
    description: 'Commandez en groupe pour votre entreprise ou événement. SEMOUS propose des formules entreprise dès 70 EUR, livraison ou retrait à Toulouse.',
    keywords: 'commande groupe, entreprise, événement, semoule, toulouse',
  })
  const [form, setForm] = useState({
    nom_groupe: '', prenom_referent: '', email_referent: '', telephone_referent: '',
    adresse_livraison: '', date_souhaitee: '', heure_souhaitee: '',
    nombre_personnes: '', budget_approximatif: '', produits_souhaites: '',
    commentaire: '', demande_facture: false, siret: '', mode_paiement: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error: companyError, data: company } = await supabase
        .from('companies')
        .insert({
          nom: form.nom_groupe,
          siret: form.siret || null,
          email_referent: form.email_referent,
          telephone_referent: form.telephone_referent,
          prenom_referent: form.prenom_referent,
          adresse: form.adresse_livraison,
        })
        .select()
        .single()

      if (companyError) throw companyError

      await supabase.from('company_orders').insert({
        company_id: company.id,
        nombre_personnes: parseInt(form.nombre_personnes) || null,
        budget_approximatif: parseFloat(form.budget_approximatif) || null,
        demande_facture: form.demande_facture,
        statut_validation: 'en_attente',
      })

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de l\'envoi. Réessayez ou contactez-nous par WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Demande envoyée !</h1>
        <p className="text-semous-gray-text text-sm mb-6">
          Votre demande de commande groupe a bien été reçue.
          L&apos;équipe SEMOUS vous contactera dans les meilleurs délais pour confirmer les détails.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title mb-2">Commandes groupes & entreprises</h1>
      <p className="text-semous-gray-text text-sm mb-8">
        Repas d&apos;équipe, salariés, associations, syndics ou groupes ponctuels.
      </p>

      {/* Règles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Building2, title: 'Min. 70 EUR', desc: 'Montant minimum' },
          { icon: Clock, title: '24h avant', desc: 'Délai de demande' },
          { icon: Users, title: '30% acompte', desc: 'Pour confirmer' },
          { icon: CheckCircle, title: 'Validation', desc: 'Obligatoire par SEMOUS' },
        ].map((item, i) => (
          <div key={i} className="card p-4 text-center">
            <item.icon size={20} className="mx-auto mb-2 text-semous-black" />
            <p className="font-bold text-sm">{item.title}</p>
            <p className="text-xs text-semous-gray-text">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <div className="card p-5 mb-8 text-sm text-semous-gray-text">
        <p className="font-semibold text-semous-black mb-2">Conditions</p>
        <p>
          SEMOUS propose un service de commandes groupées pour les équipes, salariés, entreprises, syndics,
          associations ou groupes. Toute commande groupe doit être demandée au moins 24 heures à l&apos;avance.
          Le montant minimum est fixé à 70 EUR. Un acompte de 30 % pourra être demandé pour confirmer la commande.
          Toute annulation doit être faite au moins 12 heures avant l&apos;heure prévue.
          Les ajouts sont possibles jusqu&apos;à 2 heures avant, sous réserve d&apos;acceptation par SEMOUS.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
        <p className="font-semibold text-lg mb-2">Formulaire de demande</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium mb-1 block">Nom du groupe / entreprise *</label>
            <input required className="input-field" value={form.nom_groupe} onChange={e => setForm(f => ({ ...f, nom_groupe: e.target.value }))} placeholder="Mon Entreprise SAS" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Prénom référent *</label>
            <input required className="input-field" value={form.prenom_referent} onChange={e => setForm(f => ({ ...f, prenom_referent: e.target.value }))} placeholder="Prénom" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email *</label>
            <input required type="email" className="input-field" value={form.email_referent} onChange={e => setForm(f => ({ ...f, email_referent: e.target.value }))} placeholder="referent@entreprise.com" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Téléphone *</label>
            <input required className="input-field" value={form.telephone_referent} onChange={e => setForm(f => ({ ...f, telephone_referent: e.target.value }))} placeholder="06 XX XX XX XX" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Adresse de livraison</label>
            <input className="input-field" value={form.adresse_livraison} onChange={e => setForm(f => ({ ...f, adresse_livraison: e.target.value }))} placeholder="Adresse complète" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Date souhaitée *</label>
            <input required type="date" className="input-field" value={form.date_souhaitee} onChange={e => setForm(f => ({ ...f, date_souhaitee: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Heure souhaitée *</label>
            <input required type="time" className="input-field" value={form.heure_souhaitee} onChange={e => setForm(f => ({ ...f, heure_souhaitee: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Nombre de personnes *</label>
            <input required type="number" min="1" className="input-field" value={form.nombre_personnes} onChange={e => setForm(f => ({ ...f, nombre_personnes: e.target.value }))} placeholder="10" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Budget approximatif (EUR)</label>
            <input type="number" min="70" className="input-field" value={form.budget_approximatif} onChange={e => setForm(f => ({ ...f, budget_approximatif: e.target.value }))} placeholder="100" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium mb-1 block">Produits souhaités & commentaire</label>
            <textarea className="input-field resize-none" rows={4} value={form.produits_souhaites} onChange={e => setForm(f => ({ ...f, produits_souhaites: e.target.value }))} placeholder="Décrivez vos souhaits, options, régimes alimentaires..." />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Mode de paiement souhaité</label>
            <select className="input-field" value={form.mode_paiement} onChange={e => setForm(f => ({ ...f, mode_paiement: e.target.value }))}>
              <option value="">Choisir...</option>
              <option value="carte">Carte bancaire en ligne</option>
              <option value="tpe">TPE sur place</option>
              <option value="virement">Virement</option>
              <option value="facture">Paiement sur facture</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">SIRET (facultatif)</label>
            <input className="input-field" value={form.siret} onChange={e => setForm(f => ({ ...f, siret: e.target.value }))} placeholder="12345678900000" />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.demande_facture} onChange={e => setForm(f => ({ ...f, demande_facture: e.target.checked }))} />
              <span className="text-sm">Je souhaite une facture</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Envoyer ma demande
        </button>
      </form>
    </div>
  )
}
