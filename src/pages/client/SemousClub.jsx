import { Link } from 'react-router-dom'
import { Star, Gift, Trophy, Zap } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

export default function SemousClub() {
  useSeo({ title: 'SEMOUS CLUB', description: 'Rejoignez le programme de fidélité SEMOUS. Points, récompenses, offres exclusives — bientôt disponible.' })
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-semous-gray-text mb-3">Bientôt disponible</p>
      <h1 className="text-4xl font-bold mb-4">SEMOUS CLUB</h1>
      <p className="text-semous-gray-text text-lg mb-10 max-w-xl mx-auto">
        SEMOUS CLUB arrive bientôt. Créez votre compte SEMOUS pour être prêt à profiter
        des futurs avantages, offres, jeux et récompenses.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Star, title: 'Points fidélité', desc: 'Gagnez des points à chaque commande' },
          { icon: Gift, title: 'Récompenses', desc: 'Échangez vos points contre des offres' },
          { icon: Trophy, title: 'Classements', desc: 'Défiez les autres membres du club' },
          { icon: Zap, title: 'Missions', desc: 'Des défis exclusifs pour les membres' },
        ].map((item, i) => (
          <div key={i} className="card p-5">
            <item.icon size={24} className="mx-auto mb-3 text-semous-black" />
            <p className="font-semibold text-sm mb-1">{item.title}</p>
            <p className="text-xs text-semous-gray-text">{item.desc}</p>
          </div>
        ))}
      </div>

      <Link to="/compte" className="btn-primary inline-block">
        Créer mon compte SEMOUS
      </Link>
      <p className="text-xs text-semous-gray-text mt-4">
        Un compte SEMOUS vous permettra d&apos;accéder au SEMOUS CLUB dès son lancement.
      </p>
    </div>
  )
}
