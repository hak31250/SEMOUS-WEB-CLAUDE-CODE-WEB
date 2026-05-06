// Edge Function: send-notification
// Triggered by Supabase webhooks or called directly from the backend
// Handles: order confirmation emails, status update notifications
//
// To deploy: supabase functions deploy send-notification
// To set secrets: supabase secrets set RESEND_API_KEY=<key>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  type: 'order_confirmation' | 'order_status' | 'order_refused' | 'contact_reply'
  to: string
  order_numero?: string
  order_statut?: string
  order_total?: number
  customer_prenom?: string
  message?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const payload: NotificationPayload = await req.json()
    const resendKey = Deno.env.get('RESEND_API_KEY')

    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — email skipped')
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const emailContent = buildEmail(payload)
    if (!emailContent) {
      return new Response(JSON.stringify({ ok: false, error: 'Unknown notification type' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SEMOUS <commandes@semous.fr>',
        to: [payload.to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})

function buildEmail(p: NotificationPayload): { subject: string; html: string } | null {
  const base = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2 style="color:#111;margin-bottom:4px">SEMOUS</h2>
      <p style="color:#888;font-size:12px;margin-top:0">Bols à la semoule · Toulouse</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
  `
  const footer = `
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="color:#aaa;font-size:11px">SEMOUS · 32 av. Honoré Serres, 31000 Toulouse · semous.fr</p>
    </div>
  `

  if (p.type === 'order_confirmation') {
    return {
      subject: `Commande confirmée — ${p.order_numero}`,
      html: `${base}
        <h3>Merci ${p.customer_prenom || ''} !</h3>
        <p>Votre commande <strong>${p.order_numero}</strong> a bien été reçue.</p>
        <p>Total : <strong>${formatPrice(p.order_total || 0)}</strong></p>
        <p>Nous vous tiendrons informé(e) de l'avancement de votre commande.</p>
        ${footer}`,
    }
  }

  if (p.type === 'order_status') {
    return {
      subject: `Votre commande ${p.order_numero} — ${statusLabel(p.order_statut || '')}`,
      html: `${base}
        <h3>Mise à jour de votre commande</h3>
        <p>Votre commande <strong>${p.order_numero}</strong> est maintenant : <strong>${statusLabel(p.order_statut || '')}</strong></p>
        ${footer}`,
    }
  }

  if (p.type === 'order_refused') {
    return {
      subject: `Commande ${p.order_numero} — Refusée`,
      html: `${base}
        <h3>Nous ne pouvons pas honorer votre commande</h3>
        <p>Votre commande <strong>${p.order_numero}</strong> a été refusée.</p>
        <p>Si vous avez payé en ligne, le remboursement sera effectué sous 3-5 jours ouvrés.</p>
        <p>Contactez-nous sur WhatsApp pour plus d'informations.</p>
        ${footer}`,
    }
  }

  if (p.type === 'contact_reply') {
    return {
      subject: 'SEMOUS vous répond',
      html: `${base}
        <h3>Réponse à votre message</h3>
        <p>${p.message?.replace(/\n/g, '<br>') || ''}</p>
        ${footer}`,
    }
  }

  return null
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    acceptee: 'Acceptée',
    en_preparation: 'En préparation',
    prete: 'Prête',
    en_livraison: 'En livraison',
    livree: 'Livrée',
    terminee: 'Terminée',
    refusee: 'Refusée',
  }
  return map[s] || s
}
