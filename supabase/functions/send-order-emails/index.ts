import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "npm:nodemailer@6.9.13"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
}

const INTERNAL_SECRET = 'lashglaze_db_trigger_secret_2026';

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    let body: any = {}
    try {
      body = await req.json()
    } catch (_) {
      // Empty body
    }

    const { orderId, test, testType, testEmail, testSmtp } = body

    // 1. Fetch Store settings to get SMTP config
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsError || !settings) {
      throw new Error(`Failed to load store settings: ${settingsError?.message || 'No settings found'}`)
    }

    // Determine SMTP configuration (either passed in test, or from DB)
    const smtpHost = testSmtp?.smtpHost || settings.smtp_host
    const smtpPort = parseInt(testSmtp?.smtpPort || settings.smtp_port || '587', 10)
    const smtpUser = testSmtp?.smtpUser || settings.smtp_user
    const smtpPass = testSmtp?.smtpPass || settings.smtp_pass
    const fromCustomer = testSmtp?.emailFromCustomer || settings.email_from_customer || 'orders@lashglaze.com'
    const fromOwner = testSmtp?.emailFromOwner || settings.email_from_owner || 'info@lashglaze.com'
    const toOwner = testSmtp?.emailToOwner || settings.email_to_owner || 'owner@lashglaze.com'
    const currency = settings.currency || '£'

    // If it's not a test, verify caller is authenticated or has the internal database secret
    if (!test) {
      const authHeader = req.headers.get('Authorization')
      const internalSecretHeader = req.headers.get('x-internal-secret')
      
      const isInternalTrigger = internalSecretHeader === INTERNAL_SECRET
      const isServiceRole = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'never_match')
      
      // Let's also check if they are logged in as admin by validating their auth token
      let isAdminUser = false
      if (authHeader && !isServiceRole) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          isAdminUser = profile?.role === 'admin' || user.email === 'admin@lashglaze.com'
        }
      }

      if (!isInternalTrigger && !isServiceRole && !isAdminUser) {
        return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Verify we have SMTP credentials configured
    if (!smtpHost || !smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'SMTP configurations are incomplete. Please set Host, Username, and Password.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // 2. Set up Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // --- HTML Email Templates Helpers ---

    const getCustomerTemplate = (customerName: string, orderNum: string, itemsListHtml: string, totalStr: string, shippingAddress: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - LashGlaze</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600;1,700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #F9F8F6;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            background-color: #F9F8F6;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border: 1px solid #E8D5C4;
          }
          .header {
            text-align: center;
            padding: 40px 20px;
            background-color: #1A1A1A;
            border-bottom: 2px solid #D4AF37;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 700;
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #D4AF37;
            text-decoration: none;
            display: inline-block;
          }
          .subtitle {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: #FDFCFB;
            font-weight: 500;
            margin-top: 10px;
            display: block;
            opacity: 0.8;
          }
          .hero-section {
            padding: 50px 40px;
            text-align: center;
            background-color: #FFFFFF;
          }
          .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-style: italic;
            font-weight: 600;
            color: #1A1A1A;
            margin: 0 0 15px 0;
          }
          .hero-text {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            color: #9A9187;
            font-weight: 600;
            margin: 0;
          }
          .content-section {
            padding: 0 40px 40px 40px;
          }
          .greeting {
            font-size: 15px;
            line-height: 1.8;
            color: #4A4A4A;
            margin-bottom: 35px;
            font-weight: 300;
          }
          .section-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-weight: 700;
            color: #1A1A1A;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #E8D5C4;
          }
          .items-container {
            margin-bottom: 30px;
          }
          .totals-table {
            width: 100%;
            font-size: 13px;
            color: #4A4A4A;
            margin-top: 30px;
            border-top: 1px solid #E8D5C4;
            padding-top: 20px;
          }
          .totals-table td {
            padding: 10px 0;
          }
          .totals-table .label-col {
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 11px;
            color: #9A9187;
            font-weight: 600;
          }
          .totals-table .value-col {
            text-align: right;
            font-weight: 500;
            color: #1A1A1A;
          }
          .totals-table .grand-total-row td {
            padding-top: 20px;
            border-top: 1px solid #E8D5C4;
          }
          .totals-table .grand-total-label {
            font-size: 13px;
            font-weight: 700;
            color: #1A1A1A;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .totals-table .grand-total-value {
            font-size: 18px;
            font-weight: 700;
            color: #D4AF37;
            text-align: right;
          }
          .address-card {
            background-color: #F9F8F6;
            border: 1px solid #E8D5C4;
            padding: 25px;
            font-size: 14px;
            line-height: 1.7;
            color: #4A4A4A;
            border-radius: 2px;
          }
          .address-name {
            font-weight: 600;
            color: #1A1A1A;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            background-color: #1A1A1A;
            color: #FDFCFB;
            padding: 40px 20px;
          }
          .footer-text {
            font-size: 10px;
            color: #9A9187;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            line-height: 2;
            margin: 0;
          }
          .footer-social {
            margin-top: 20px;
            font-size: 11px;
            letter-spacing: 0.15em;
            font-weight: 600;
          }
          .footer-social a {
            color: #D4AF37;
            text-decoration: none;
            margin: 0 12px;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <a href="#" class="logo">LashGlaze</a>
              <span class="subtitle">Strip Lashes & Editorial Atelier</span>
            </div>
            
            <div class="hero-section">
              <h1 class="hero-title">Thank You For Your Order</h1>
              <p class="hero-text">Order Ref: #${orderNum}</p>
            </div>
            
            <div class="content-section">
              <div class="greeting">
                Dear ${customerName},<br><br>
                We are delighted to confirm that your order has been received at the LashGlaze fulfillment center. Our team is handcrafting and selecting your editorial lash assets with utmost precision. We will notify you once your package is en route.
              </div>
              
              <h3 class="section-title">Your Editorial Selection</h3>
              <div class="items-container">
                ${itemsListHtml}
              </div>
              
              <table class="totals-table" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="label-col">Subtotal</td>
                  <td class="value-col">${totalStr}</td>
                </tr>
                <tr>
                  <td class="label-col">Shipping</td>
                  <td class="value-col">Complimentary</td>
                </tr>
                <tr class="grand-total-row">
                  <td class="grand-total-label">Total</td>
                  <td class="grand-total-value">${totalStr}</td>
                </tr>
              </table>
            </div>
            
            <div class="content-section" style="padding-top: 10px;">
              <h3 class="section-title">Logistics Destination</h3>
              <div class="address-card">
                <div class="address-name">${customerName}</div>
                ${shippingAddress}
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-social">
                <a href="https://instagram.com/lashglaze">Instagram</a>
                <a href="https://tiktok.com/@lashglaze">TikTok</a>
              </div>
              <div style="margin: 25px auto; width: 40px; height: 1px; background-color: #333;"></div>
              <p class="footer-text">
                LashGlaze Atelier &copy; ${new Date().getFullYear()}. All Rights Reserved.<br>
                Need assistance? Connect with us at ${settings?.support_email || 'info@lashglaze.com'}.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const getOwnerTemplate = (customerName: string, customerEmail: string, orderNum: string, itemsListHtml: string, totalStr: string, shippingAddress: string, paymentMethod: string, orderDateStr: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert - LashGlaze</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600;1,700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #130F15;
            color: #F2F2F3;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            background-color: #130F15;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1A151D;
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 4px;
            overflow: hidden;
          }
          .header {
            text-align: center;
            padding: 30px;
            background-color: #130F15;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 700;
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            color: #D4AF37;
            text-decoration: none;
          }
          .alert-banner {
            background-color: #2D231E;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 1px solid rgba(212,175,55,0.1);
          }
          .alert-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: #D4AF37;
            font-weight: 700;
            margin: 0 0 15px 0;
          }
          .alert-amount {
            font-size: 38px;
            font-weight: 700;
            color: #FFFFFF;
            margin: 0;
            letter-spacing: -0.02em;
          }
          .content-section {
            padding: 35px 30px;
          }
          .section-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-weight: 700;
            color: #D4AF37;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 10px;
          }
          .data-table {
            width: 100%;
            font-size: 13px;
            margin-bottom: 35px;
            border-collapse: collapse;
          }
          .data-table td {
            padding: 12px 0;
            border-bottom: 1px solid rgba(255,255,255,0.03);
          }
          .data-label {
            color: #9A9187;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 11px;
            font-weight: 600;
            width: 40%;
            vertical-align: top;
          }
          .data-value {
            font-weight: 500;
            color: #FFFFFF;
            width: 60%;
            line-height: 1.5;
          }
          .items-wrapper {
            background-color: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.03);
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background-color: #130F15;
            color: #9A9187;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-top: 1px solid rgba(255,255,255,0.05);
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">LashGlaze Alert</span>
            </div>
            
            <div class="alert-banner">
              <h1 class="alert-title">New Order Received</h1>
              <div class="alert-amount">${totalStr}</div>
            </div>
            
            <div class="content-section">
              <h3 class="section-title">Order Ledger</h3>
              <table class="data-table">
                <tr>
                  <td class="data-label">Order Number</td>
                  <td class="data-value">#${orderNum}</td>
                </tr>
                <tr>
                  <td class="data-label">Order Date</td>
                  <td class="data-value">${orderDateStr}</td>
                </tr>
                <tr>
                  <td class="data-label">Payment Method</td>
                  <td class="data-value" style="color: #D4AF37; font-weight: 600;">${paymentMethod}</td>
                </tr>
              </table>
              
              <h3 class="section-title">Client Details</h3>
              <table class="data-table">
                <tr>
                  <td class="data-label">Name</td>
                  <td class="data-value">${customerName}</td>
                </tr>
                <tr>
                  <td class="data-label">Email</td>
                  <td class="data-value"><a href="mailto:${customerEmail}" style="color: #FFFFFF; text-decoration: none;">${customerEmail}</a></td>
                </tr>
                <tr>
                  <td class="data-label">Shipping Address</td>
                  <td class="data-value">${shippingAddress}</td>
                </tr>
              </table>
              
              <h3 class="section-title">Manifest</h3>
              <div class="items-wrapper">
                ${itemsListHtml}
              </div>
            </div>
            
            <div class="footer">
              LashGlaze Automated Operations
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Helper to generate the items HTML
    const getItemsHtml = (items: any[], type: 'customer' | 'owner') => {
      let html = '';
      if (items && items.length > 0) {
        for (const item of items) {
          const prodName = item.products?.name || item.name || 'Lash Set';
          const itemPrice = `${currency}${Number(item.price).toFixed(2)}`;
          const lineTotal = `${currency}${(Number(item.price) * item.quantity).toFixed(2)}`;
          
          if (type === 'customer') {
            html += `
              <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #E8D5C4; padding: 20px 0;">
                <tr>
                  <td style="width: 75%; padding-right: 15px;">
                    <div style="font-size: 14px; font-weight: 600; color: #1A1A1A; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em;">${prodName}</div>
                    <div style="font-size: 12px; color: #9A9187;">
                      QTY: <span style="color: #1A1A1A; font-weight: 500;">${item.quantity}</span>
                      ${item.quantity > 1 ? ` <span style="margin: 0 8px; color: #E8D5C4;">|</span> EACH: <span style="color: #1A1A1A; font-weight: 500;">${itemPrice}</span>` : ''}
                    </div>
                  </td>
                  <td style="width: 25%; text-align: right; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 700; color: #1A1A1A;">${lineTotal}</div>
                  </td>
                </tr>
              </table>
            `;
          } else {
            html += `
              <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px 0;">
                <tr>
                  <td style="width: 70%; padding-right: 15px;">
                    <div style="font-size: 13px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${prodName}</div>
                    <div style="font-size: 11px; color: #9A9187;">
                      QTY: <span style="color: #FFFFFF; font-weight: 500;">${item.quantity}</span>
                      ${item.quantity > 1 ? ` <span style="margin: 0 8px; opacity: 0.3;">|</span> EACH: <span style="color: #FFFFFF; font-weight: 500;">${itemPrice}</span>` : ''}
                    </div>
                  </td>
                  <td style="width: 30%; text-align: right; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 700; color: #D4AF37;">${lineTotal}</div>
                  </td>
                </tr>
              </table>
            `;
          }
        }
      } else {
        if (type === 'customer') {
          html += `
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #E8D5C4; padding: 20px 0;">
              <tr>
                <td style="width: 75%; padding-right: 15px;">
                  <div style="font-size: 14px; font-weight: 600; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.05em;">Custom Order</div>
                </td>
              </tr>
            </table>
          `;
        } else {
          html += `
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px 0;">
              <tr>
                <td style="width: 70%; padding-right: 15px;">
                  <div style="font-size: 13px; font-weight: 600; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">Custom Order Total</div>
                </td>
              </tr>
            </table>
          `;
        }
      }
      return html;
    }

    // --- EXECUTION FLOWS ---

    // FLOW A: Test Sending
    if (test) {
      if (!testEmail) {
        return new Response(JSON.stringify({ success: false, error: 'Recipient test email address is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      const mockItems = [{ name: 'Volume Lash Set', price: 41.95, quantity: 1 }];
      const mockItemsHtmlCustomer = getItemsHtml(mockItems, 'customer');
      const mockItemsHtmlOwner = getItemsHtml(mockItems, 'owner');
      
      let testSubject = testType === 'customer' ? 'Your LashGlaze Order Confirmation #9999 [TEST]' : `Lash Glaze - NEW ORDER ALERT`
      const sender = testType === 'customer' ? fromCustomer : fromOwner
      const recipient = testType === 'customer' ? testEmail : (toOwner || testEmail)
      
      const formattedDate = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'medium', timeStyle: 'short' })
      
      let htmlBody = testType === 'customer' 
        ? getCustomerTemplate('Test Customer', '9999', mockItemsHtmlCustomer, `${currency}41.95`, '123 Atelier Way<br>London<br>EC1A 1BB<br>United Kingdom')
        : getOwnerTemplate('Test Customer', 'test@lashglaze.com', '9999', mockItemsHtmlOwner, `${currency}41.95`, '123 Atelier Way, London, EC1A 1BB, United Kingdom', 'Manual/Test', formattedDate);

      try {
        await transporter.sendMail({
          from: `LashGlaze <${sender}>`,
          to: recipient,
          subject: testSubject,
          html: htmlBody
        })

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Test email successfully sent to ${recipient} from ${sender}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      } catch (err: any) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `SMTP connection failed: ${err.message}. Please verify SMTP host, port, credentials, and SSL settings.` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }
    }

    // Helper to process a single order
    const processOrder = async (order: any) => {
      const formattedNum = (order.order_number || order.orderNumber || 1000).toString()
      const paymentMethodStr = order.stripe_payment_intent_id ? 'Stripe' : order.paypal_order_id ? 'PayPal' : 'Manual/Test'
      const totalAmountStr = `${currency}${Number(order.total).toFixed(2)}`
      
      // Parse address
      const addressParts = [
        order.shipping_address,
        order.shipping_city,
        order.shipping_postal_code,
        order.shipping_country
      ].filter(Boolean)
      const addressStr = addressParts.join(', ') || 'No shipping address provided'
      const addressHtml = addressParts.join('<br>') || 'No shipping address provided'

      const customerItemsHtml = getItemsHtml(order.order_items, 'customer');
      const ownerItemsHtml = getItemsHtml(order.order_items, 'owner');

      let customerSent = order.customer_email_sent
      let ownerSent = order.owner_email_sent
      let errorOccurred: string | null = null

      const orderDate = order.created_at ? new Date(order.created_at) : new Date()
      const formattedDate = orderDate.toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'medium', timeStyle: 'short' })

      // Send to Customer
      if (!customerSent && order.customer_email) {
        try {
          const customerSubject = `Your LashGlaze Order Confirmation #${formattedNum}`
          const customerHtml = getCustomerTemplate(
            order.customer_name || 'Valued Client',
            formattedNum,
            customerItemsHtml,
            totalAmountStr,
            addressHtml
          )

          await transporter.sendMail({
            from: `LashGlaze <${fromCustomer}>`,
            to: order.customer_email,
            subject: customerSubject,
            html: customerHtml
          })

          customerSent = true
          await supabase
            .from('orders')
            .update({ customer_email_sent: true })
            .eq('id', order.id)
        } catch (err: any) {
          console.error(`Error sending customer email for order ${order.id}:`, err)
          errorOccurred = `Customer email failed: ${err.message}`
        }
      }

      // Send to Owner
      if (!ownerSent) {
        try {
          const ownerSubject = `Lash Glaze - NEW ORDER ALERT`
          const ownerHtml = getOwnerTemplate(
            order.customer_name || 'Anonymous',
            order.customer_email || 'No email',
            formattedNum,
            ownerItemsHtml,
            totalAmountStr,
            addressStr,
            paymentMethodStr,
            formattedDate
          )

          await transporter.sendMail({
            from: `LashGlaze Atelier <${fromOwner}>`,
            to: toOwner,
            subject: ownerSubject,
            html: ownerHtml
          })

          ownerSent = true
          await supabase
            .from('orders')
            .update({ owner_email_sent: true })
            .eq('id', order.id)
        } catch (err: any) {
          console.error(`Error sending owner email for order ${order.id}:`, err)
          errorOccurred = (errorOccurred ? errorOccurred + '; ' : '') + `Owner email failed: ${err.message}`
        }
      }

      return {
        orderId: order.id,
        customerSent,
        ownerSent,
        error: errorOccurred
      }
    }

    // FLOW B: Single Order Processing
    if (orderId) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            price,
            products (
              name,
              image
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        throw new Error(`Failed to load order details: ${orderError?.message || 'Order not found'}`)
      }

      const result = await processOrder(order)
      
      return new Response(JSON.stringify({ 
        success: !result.error, 
        result 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // FLOW C: Batch/Cron Processing (No orderId, not test)
    // Fetch up to 5 unsent orders
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          quantity,
          price,
          products (
            name,
            image
          )
        )
      `)
      .or('customer_email_sent.eq.false,owner_email_sent.eq.false')
      .order('created_at', { ascending: true })
      .limit(5)

    if (pendingError) {
      throw new Error(`Failed to fetch pending orders: ${pendingError.message}`)
    }

    const processedResults = []
    if (pendingOrders && pendingOrders.length > 0) {
      for (const order of pendingOrders) {
        const res = await processOrder(order)
        processedResults.push(res)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processedCount: processedResults.length,
      results: processedResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
