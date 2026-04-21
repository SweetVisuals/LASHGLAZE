import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2025-01-27.acacia',
    })

    const { amount, currency, email, isSubscription, interval, successUrl, cancelUrl } = await req.json()

    if (isSubscription) {
      // Create a Checkout Session for Subscription
      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        line_items: [
          {
            // Mapping from user
            price: interval === 'fortnightly' ? 'price_1TOgu3HhaunZcJ9FafFrifVJ' : 'price_1TOgvWHhaunZcJ9Fb0InxB0H',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          email,
          interval
        }
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // Create a PaymentIntent for one-time purchase
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency,
        receipt_email: email,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
