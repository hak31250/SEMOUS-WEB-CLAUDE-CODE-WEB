import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

const DEFAULT_FAQS = [
  { question: 'Quelle est la zone de livraison ?', reponse: 'SEMOUS livre dans un rayon de 7 km autour du restaurant (32 av. Honoré Serres, Toulouse). Au-delà, le retrait à emporter est disponible ou consultez Uber Eats / Deliveroo.' },
  { question: 'Quel est le minimum de commande pour la livraison ?', reponse: 'Le minimum de commande pour la livraison est de 15 EUR. La livraison est offerte à partir de 20 EUR.' },
  { question: 'Quels sont les frais de livraison ?', reponse: '3 EUR pour 0–3 km, 4 EUR pour 3–5 km, 5 EUR pour 5–7 km. Gratuit dès 20 EUR de commande.' },
  { question: 'Comment fonctionnent les commandes groupes ?', reponse: 'Les commandes groupes doivent être demandées au moins 24h à l\'avance, avec un minimum de 70 EUR. Un acompte de 30 % peut être demandé. Rendez-vous sur notre page Entreprises pour faire une demande.' },
  { question: 'Puis-je commander sans créer de compte ?', reponse: 'Oui, vous pouvez commander en tant qu\'invité en fournissant simplement votre email, prénom et téléphone (pour la livraison). Créer un compte vous permet de retrouver votre historique et de préparer l\'accès au SEMOUS CLUB.' },
  { question: 'Les produits sont-ils halal ?', reponse: 'Oui, tous les produits SEMOUS sont halal.' },
  { question: 'Comment utiliser un code promo ?', reponse: 'Entrez votre code promo au moment du paiement dans le champ prévu. Un seul code promo par commande.' },
]

export default function FAQ() {
  useSeo({
    title: 'FAQ',
    description: 'Toutes vos questions sur les commandes SEMOUS : zone de livraison, frais, horaires, paiement, produits halal.',
  })
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    supabase.from('faqs').select('*').eq('visible', true).order('ordre')
      .then(({ data }) => { if (data?.length) setFaqs(data) })
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="section-title mb-8">Questions fréquentes</h1>
      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 py-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-sm pr-4">{faq.question}</span>
              {open === i ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-semous-gray-text border-t border-semous-gray-mid pt-3">
                {faq.reponse}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
