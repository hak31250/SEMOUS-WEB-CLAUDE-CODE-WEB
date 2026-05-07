import { Link } from 'react-router-dom'
import { MapPin, Clock, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-semous-black text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-bold text-xl mb-2">SEMOUS</p>
            <p className="text-sm text-gray-400">
              Restaurant halal — Bols à la semoule<br />
              Toulouse, France
            </p>
          </div>

          <div>
            <p className="font-semibold mb-3 text-sm uppercase tracking-wider">Contact</p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <a href="https://maps.google.com/?q=32+avenue+Honor%C3%A9+Serres+Toulouse" className="flex items-start gap-2 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                32 av. Honoré Serres, 31000 Toulouse
              </a>
              <a href="https://wa.me/33623233677" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} />
                WhatsApp +33 6 23 23 36 77
              </a>
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 shrink-0" />
                <div>
                  <p>Lun–Jeu &amp; Dim : 19h00–00h00</p>
                  <p>Ven–Sam : 19h00–02h00</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-3 text-sm uppercase tracking-wider">Informations</p>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link to="/entreprises" className="hover:text-white transition-colors">Commandes groupes</Link>
              <Link to="/semous-club" className="hover:text-white transition-colors">SEMOUS CLUB</Link>
              <Link to="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link to="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
              <Link to="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/legal/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SEMOUS — Tous droits réservés</p>
          <p>Groupe Hounivers · hounivers.fr</p>
        </div>
      </div>
    </footer>
  )
}
