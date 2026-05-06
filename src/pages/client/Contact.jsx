import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react'

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="section-title mb-8">Contact</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Adresse</h2>
          <a
            href="https://maps.google.com/?q=32+avenue+Honoré+Serres+Toulouse"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-sm text-semous-gray-text hover:text-semous-black"
          >
            <MapPin size={16} className="mt-0.5 shrink-0" />
            32 avenue Honoré Serres<br />31000 Toulouse
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Horaires</h2>
          <div className="flex items-start gap-3 text-sm text-semous-gray-text">
            <Clock size={16} className="mt-0.5 shrink-0" />
            <div>
              <p>Lundi – Jeudi & Dimanche</p>
              <p className="font-medium text-semous-black">19h00 – 00h00</p>
              <p className="mt-2">Vendredi – Samedi</p>
              <p className="font-medium text-semous-black">19h00 – 02h00</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">WhatsApp</h2>
          <a
            href="https://wa.me/33623233677"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-semous-gray-text hover:text-semous-black"
          >
            <Phone size={16} />
            +33 6 23 23 36 77
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Snapchat</h2>
          <div className="flex items-center gap-3 text-sm text-semous-gray-text">
            <MessageCircle size={16} />
            semous.31
          </div>
        </div>
      </div>

      {/* Map embed placeholder */}
      <div className="card overflow-hidden">
        <iframe
          title="SEMOUS sur la carte"
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://www.openstreetmap.org/export/embed.html?bbox=1.4327%2C43.5993%2C1.4400%2C43.6050&layer=mapnik&marker=43.5993%2C1.4327"
        />
      </div>
    </div>
  )
}
