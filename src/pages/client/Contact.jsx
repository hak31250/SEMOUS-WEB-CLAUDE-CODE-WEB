import { useState } from 'react'
import { MapPin, Clock, Phone, MessageCircle, Send, Loader2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSeo } from '@/hooks/useSeo'
import toast from 'react-hot-toast'

export default function Contact() {
  useSeo({
    title: 'Contact',
    description: 'Contactez SEMOUS par WhatsApp, Snapchat ou via notre formulaire. Adresse : 32 av. Honoré Serres, Toulouse.',
  })

  const [form, setForm] = useState({ prenom: '', email: '', sujet: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.prenom.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Merci de remplir tous les champs obligatoires')
      return
    }
    setSending(true)
    const { error } = await supabase.from('support_tickets').insert({
      email_client: form.email,
      sujet: form.sujet || `Message de ${form.prenom}`,
      statut: 'ouvert',
      priorite: 'normale',
      source: 'formulaire_contact',
    }).select().single()

    if (!error) {
      await supabase.from('support_messages').insert({
        ticket_id: (await supabase.from('support_tickets').select('id').eq('email_client', form.email).order('created_at', { ascending: false }).limit(1).single()).data?.id,
        auteur: 'client',
        contenu: `Prénom: ${form.prenom}\n\n${form.message}`,
      })
    }

    setSending(false)
    if (error) { toast.error('Erreur lors de l\'envoi'); return }
    setSent(true)
    toast.success('Message envoyé !')
  }

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
            <Phone size={16} />+33 6 23 23 36 77
          </a>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Snapchat</h2>
          <div className="flex items-center gap-3 text-sm text-semous-gray-text">
            <MessageCircle size={16} />semous.31
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-5">Nous écrire</h2>
        {sent ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <p className="font-semibold mb-2">Message envoyé !</p>
            <p className="text-sm text-semous-gray-text">Notre équipe vous répondra dans les meilleurs délais.</p>
            <button onClick={() => { setSent(false); setForm({ prenom: '', email: '', sujet: '', message: '' }) }}
              className="mt-5 text-sm text-semous-gray-text underline">
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Prénom *</label>
                <input required className="input-field" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Votre prénom" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Email *</label>
                <input required type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Sujet</label>
              <input className="input-field" value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} placeholder="Objet de votre message..." />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Message *</label>
              <textarea required className="input-field resize-none" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Votre message..." />
            </div>
            <button type="submit" disabled={sending} className="btn-primary flex items-center justify-center gap-2 self-end px-8">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Envoyer
            </button>
          </form>
        )}
      </div>

      {/* Map */}
      <div className="card overflow-hidden mt-6">
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
