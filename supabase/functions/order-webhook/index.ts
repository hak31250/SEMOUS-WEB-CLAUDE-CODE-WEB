// Edge Function: order-webhook
// Called by Supabase Database Webhooks on orders table INSERT/UPDATE
// Sends appropriate email notifications via send-notification function
//
// Webhook setup in Supabase Dashboard:
//   Table: orders, Events: INSERT + UPDATE
//   URL: https://<project>.supabase.co/functions/v1/order-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { type, record, old_record } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get customer email
    let customerEmail: string | null = null
    let customerPrenom: string | null = null

    if (record.user_id) {
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('prenom, email')
        .eq('user_id', record.user_id)
        .single()
      customerEmail = profile?.email
      customerPrenom = profile?.prenom
    } else if (record.guest_id) {
      const { data: guest } = await supabase
        .from('guest_customers')
        .select('email, prenom')
        .eq('id', record.guest_id)
        .single()
      customerEmail = guest?.email
      customerPrenom = guest?.prenom
    }

    if (!customerEmail) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no email' }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const notifUrl = `${supabaseUrl}/functions/v1/send-notification`
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${supabaseKey}` }

    // INSERT → order_confirmation
    if (type === 'INSERT') {
      await fetch(notifUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'order_confirmation',
          to: customerEmail,
          order_numero: record.numero,
          order_total: record.total_ttc,
          customer_prenom: customerPrenom,
        }),
      })
    }

    // UPDATE → status changed
    if (type === 'UPDATE' && old_record?.statut !== record.statut) {
      const notifType = record.statut === 'refusee' ? 'order_refused' : 'order_status'
      await fetch(notifUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: notifType,
          to: customerEmail,
          order_numero: record.numero,
          order_statut: record.statut,
        }),
      })
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
