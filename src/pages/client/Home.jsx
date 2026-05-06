import { Link } from 'react-router-dom'
import { MapPin, Truck, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { useStoreStatus } from '@/hooks/useStoreStatus'

export default function Home() {
  useSeo({
    title: 'Accueil',
    description: 'SEMOUS — Bols à la semoule halal à Toulouse. Commandez en ligne pour la livraison ou le retrait. Ouvert tous les soirs dès 19h.',
    keywords: 'semous, semoule, halal, toulouse, livraison, retrait, commande en ligne',
  })
  const { isOpen, hoursOpen, commandesActives, closedMessage } = useStoreStatus()

  return (
    <div className="min-h-screen">
      {/* Closed banner */}
      {!isOpen && (
        <div className={`px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2 ${commandesActives ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'}`}>
          <AlertCircle size={16} />
          {closedMessage || (!hoursOpen ? 'Nous sommes fermés pour le moment. Réouverture ce soir à 19h.' : 'Les commandes sont temporairement indisponibles.')}
        </div>
      )}

      {/* Hero */}
      <section className="bg-semous-black text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Des bols généreux,<br />
            <span className="text-gray-300">vraiment halal.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-3">
            SEMOUS — Restaurant halal à Toulouse.<br />
            Commande en ligne, livraison ou retrait.
          </p>
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-6 ${isOpen ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isOpen ? 'Ouvert — commandes en ligne' : 'Actuellement fermé'}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/menu" className="btn-primary text-center">
              {isOpen ? 'Commander maintenant' : 'Voir la carte'}
            </Link>
            <Link to="/menu" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-semous-black text-center">
              Notre carte
            </Link>
          </div>
        </div>
      </section>

      {/* Mode commande */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-8">Comment commander ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/menu" className="card p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-semous-black text-white flex items-center justify-center group-hover:bg-semous-green transition-colors">
                  <Truck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Livraison à domicile</h3>
                  <p className="text-sm text-semous-gray-text">Rayon 7 km autour du restaurant</p>
                </div>
              </div>
              <ul className="text-sm text-semous-gray-text space-y-1">
                <li>• Frais : 3 à 5 EUR selon la distance</li>
                <li>• Livraison offerte dès 20 EUR</li>
                <li>• Minimum de commande : 15 EUR</li>
              </ul>
            </Link>

            <Link to="/menu" className="card p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-semous-black text-white flex items-center justify-center group-hover:bg-semous-green transition-colors">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Retrait à emporter</h3>
                  <p className="text-sm text-semous-gray-text">32 av. Honoré Serres, Toulouse</p>
                </div>
              </div>
              <ul className="text-sm text-semous-gray-text space-y-1">
                <li>• Paiement en ligne ou sur place</li>
                <li>• Prêt en 10–15 min</li>
                <li>• Pas de minimum de commande</li>
              </ul>
            </Link>
          </div>
        </div>
      </section>

      {/* Horaires */}
      <section className="py-12 px-4 bg-semous-gray">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-6">Horaires d'ouverture</h2>
          <div className="inline-grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="card px-6 py-4">
              <p className="font-semibold mb-1">Lundi – Jeudi & Dimanche</p>
              <p className="text-semous-gray-text">19h00 – 00h00</p>
            </div>
            <div className="card px-6 py-4">
              <p className="font-semibold mb-1">Vendredi – Samedi</p>
              <p className="text-semous-gray-text">19h00 – 02h00</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-semous-gray-text">
            <MapPin size={16} />
            <span>32 avenue Honoré Serres, 31000 Toulouse</span>
          </div>
        </div>
      </section>

      {/* Entreprises */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <h2 className="section-title mb-3">Commandes groupes & entreprises</h2>
            <p className="text-semous-gray-text text-sm mb-6 max-w-lg mx-auto">
              Repas d'équipe, salariés, associations ? SEMOUS propose un service dédié
              pour les commandes groupées à partir de 70 EUR.
            </p>
            <Link to="/entreprises" className="btn-green inline-block">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* SEMOUS CLUB teaser */}
      <section className="py-12 px-4 bg-semous-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Bientôt disponible</p>
          <h2 className="text-3xl font-bold mb-3">SEMOUS CLUB</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Créez votre compte SEMOUS pour être prêt à profiter des futurs avantages,
            offres, jeux et récompenses.
          </p>
          <Link to="/compte" className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-semous-black inline-block">
            Créer mon compte
          </Link>
        </div>
      </section>
    </div>
  )
}
