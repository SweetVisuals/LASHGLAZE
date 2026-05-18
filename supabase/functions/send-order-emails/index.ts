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
      secure: smtpPort === 465, // True for 465 SSL/TLS, False for 587 or 25
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    })

    // --- HTML Email Templates Helpers ---

    const getCustomerTemplate = (customerName: string, orderNum: string, itemsListHtml: string, totalStr: string, shippingAddress: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - LashGlaze</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@1,400;1,700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Outfit', 'Inter', sans-serif;
            background-color: #FDFCFB;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FDFCFB;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: bold;
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #D4AF37;
            text-decoration: none;
            display: inline-block;
          }
          .subtitle {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: #9A9187;
            font-weight: bold;
            margin-top: 5px;
            display: block;
          }
          .hero-section {
            background-color: #F8F4F0;
            padding: 40px 30px;
            text-align: center;
            margin-bottom: 30px;
          }
          .hero-title {
            font-family: 'Playfair Display', serif;
            font-size: 26px;
            font-style: italic;
            color: #1A1A1A;
            margin: 0 0 10px 0;
          }
          .hero-text {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #9A9187;
            font-weight: 600;
            margin: 0;
          }
          .details-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-weight: 700;
            color: #D4AF37;
            margin-bottom: 15px;
          }
          .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            background-color: transparent;
          }
          .item-details {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .item-img {
            width: 45px;
            height: 45px;
            object-fit: cover;
          }
          .item-name {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0;
          }
          .item-qty {
            font-size: 10px;
            color: #9A9187;
            margin-top: 2px;
          }
          .item-price {
            font-size: 12px;
            font-weight: 700;
          }
          .divider {
            height: 1px;
            background-color: #E8D5C4;
            opacity: 0.3;
            margin: 15px 0;
          }
          .totals-table {
            width: 100%;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #9A9187;
            margin-top: 20px;
          }
          .totals-table td {
            padding: 6px 0;
          }
          .totals-table .grand-total {
            font-size: 14px;
            font-weight: bold;
            color: #1A1A1A;
          }
          .address-card {
            background-color: #F8F4F0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.6;
            color: #9A9187;
          }
          .address-name {
            font-weight: bold;
            color: #1A1A1A;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
          }
          .footer-text {
            font-size: 9px;
            color: #9A9187;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            line-height: 1.8;
          }
          .footer-social {
            margin-top: 15px;
            font-size: 10px;
            letter-spacing: 0.1em;
            font-weight: bold;
          }
          .footer-social a {
            color: #D4AF37;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">LashGlaze</a>
            <span class="subtitle">Strip Lashes & Editorial Atelier</span>
          </div>
          
          <div class="hero-section">
            <h1 class="hero-title">Thank You For Your Order</h1>
            <p class="hero-text">Order Ref: #${orderNum}</p>
          </div>
          
          <div class="details-section">
            <p style="font-size: 13px; line-height: 1.7; margin-bottom: 30px;">
              Dear ${customerName}, <br><br>
              We are delighted to confirm that your order has been received at the LashGlaze fulfillment center. Our team is handcrafting and selecting your editorial lash assets with utmost precision.
            </p>
            
            <h3 class="section-title">Your Editorial Selection</h3>
            ${itemsListHtml}
            
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right; color: #1A1A1A;">${totalStr}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td style="text-align: right; color: #1A1A1A;">Complimentary</td>
              </tr>
              <tr class="grand-total">
                <td style="padding-top: 15px;">Total</td>
                <td style="text-align: right; padding-top: 15px; color: #D4AF37;">${totalStr}</td>
              </tr>
            </table>
          </div>
          
          <div class="divider"></div>
          
          <div class="details-section" style="margin-top: 30px;">
            <h3 class="section-title">Logistics Destination</h3>
            <div class="address-card">
              <div class="address-name">${customerName}</div>
              ${shippingAddress}
            </div>
          </div>
          
          <div class="footer">
            <div class="divider"></div>
            <p class="footer-text">
              LashGlaze Atelier &copy; 2026. All Rights Reserved. <br>
              Need assistance? Connect with us at ${settings.support_email || 'info@lashglaze.com'}.
            </p>
            <div class="footer-social">
              <a href="https://instagram.com/lashglaze">Instagram</a>
              <a href="https://tiktok.com/@lashglaze">TikTok</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const getOwnerTemplate = (customerName: string, customerEmail: string, orderNum: string, itemsListHtml: string, totalStr: string, shippingAddress: string, paymentMethod: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Alert - LashGlaze Admin</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@1,400;1,700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Outfit', 'Inter', sans-serif;
            background-color: #130F15;
            color: #F2F2F3;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #130F15;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: bold;
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #D4AF37;
            text-decoration: none;
          }
          .alert-banner {
            background-color: #291F2E;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
          }
          .alert-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: #D4AF37;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          .alert-amount {
            font-size: 32px;
            font-weight: bold;
            color: #F2F2F3;
            margin: 0;
            letter-spacing: -0.02em;
          }
          .section-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-weight: 700;
            color: #9A9187;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 5px;
          }
          .data-table {
            width: 100%;
            font-size: 11px;
            margin-bottom: 30px;
          }
          .data-table td {
            padding: 8px 0;
            vertical-align: top;
          }
          .data-label {
            color: #9A9187;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            width: 150px;
          }
          .data-value {
            font-weight: 600;
            color: #F2F2F3;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            padding: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            color: #9A9187;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">LashGlaze Command Center</span>
          </div>
          
          <div class="alert-banner">
            <h1 class="alert-title">New Acquisition Registered</h1>
            <div class="alert-amount">${totalStr}</div>
          </div>
          
          <h3 class="section-title">Order Diagnostics</h3>
          <table class="data-table">
            <tr>
              <td class="data-label">Reference ID</td>
              <td class="data-value">#${orderNum}</td>
            </tr>
            <tr>
              <td class="data-label">Acquisition Date</td>
              <td class="data-value">${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</td>
            </tr>
            <tr>
              <td class="data-label">Payment Gateway</td>
              <td class="data-value" style="color: #D4AF37; text-transform: uppercase;">${paymentMethod}</td>
            </tr>
          </table>
          
          <h3 class="section-title">Client Ledger</h3>
          <table class="data-table">
            <tr>
              <td class="data-label">Legal Name</td>
              <td class="data-value">${customerName}</td>
            </tr>
            <tr>
              <td class="data-label">Correspondence</td>
              <td class="data-value">${customerEmail}</td>
            </tr>
            <tr>
              <td class="data-label">Logistics Destination</td>
              <td class="data-value">${shippingAddress}</td>
            </tr>
          </table>
          
          <h3 class="section-title">Manifest</h3>
          <div style="margin-bottom: 40px;">
            ${itemsListHtml}
          </div>
          
          <div class="footer">
            Atelier Engine v2.4.8 &bull; Instant Notification Protocol
          </div>
        </div>
      </body>
      </html>
    `

    // --- EXECUTION FLOWS ---

    // FLOW A: Test Sending
    if (test) {
      if (!testEmail) {
        return new Response(JSON.stringify({ success: false, error: 'Recipient test email address is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      const mockItemsHtml = `
        <div class="order-item">
          <div class="item-details">
            <div class="item-name">VOLUME LASH SET</div>
          </div>
          <div class="item-price">1 x ${currency}41.95</div>
        </div>
      `
      
      const testSubject = testType === 'customer' ? 'LashGlaze Order Confirmation [TEST]' : 'New LashGlaze Order Alert [TEST]'
      const sender = testType === 'customer' ? fromCustomer : fromOwner
      const recipient = testType === 'customer' ? testEmail : (toOwner || testEmail)
      const htmlBody = testType === 'customer'
        ? getCustomerTemplate('Test Customer', '9999', mockItemsHtml, `${currency}41.95`, '123 Atelier Way, London, EC1A 1BB')
        : getOwnerTemplate('Test Customer', 'test@lashglaze.com', '9999', mockItemsHtml, `${currency}41.95`, '123 Atelier Way, London, EC1A 1BB', 'Manual/Test')

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
      } catch (err) {
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
      const totalAmountStr = `${currency}${order.total}`
      
      // Parse address
      const addressParts = [
        order.shipping_address,
        order.shipping_city,
        order.shipping_postal_code,
        order.shipping_country
      ].filter(Boolean)
      const addressStr = addressParts.join(', ') || 'No shipping address provided'
      const addressHtml = addressParts.join('<br>') || 'No shipping address'

      // Construct items list HTML for customer and owner
      let customerItemsHtml = ''
      let ownerItemsHtml = ''

      if (order.order_items && order.order_items.length > 0) {
        for (const item of order.order_items) {
          const prodName = item.products?.name || 'Editorial Lash Set'
          const itemPrice = `${currency}${item.price}`
          
          customerItemsHtml += `
            <div class="order-item">
              <div class="item-details">
                <div class="item-name">${prodName}</div>
                <div class="item-qty">Quantity: ${item.quantity}</div>
              </div>
              <div class="item-price">${item.quantity} x ${itemPrice}</div>
            </div>
            <div class="divider"></div>
          `

          ownerItemsHtml += `
            <div class="item-row">
              <span style="font-weight:600;text-transform:uppercase;">${prodName} x ${item.quantity}</span>
              <span style="color:#D4AF37;">${item.quantity} x ${itemPrice}</span>
            </div>
          `
        }
      } else {
        customerItemsHtml = `
          <div class="order-item">
            <div class="item-details">
              <div class="item-name">Custom Lash Assets</div>
            </div>
            <div class="item-price">${totalAmountStr}</div>
          </div>
        `
        ownerItemsHtml = `
          <div class="item-row">
            <span>Custom Order Total</span>
            <span>${totalAmountStr}</span>
          </div>
        `
      }

      let customerSent = order.customer_email_sent
      let ownerSent = order.owner_email_sent
      let errorOccurred = null

      // Send to Customer
      if (!customerSent && order.customer_email) {
        try {
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
            subject: `Your LashGlaze Order Confirmation #${formattedNum}`,
            html: customerHtml
          })

          customerSent = true
          await supabase
            .from('orders')
            .update({ customer_email_sent: true })
            .eq('id', order.id)
        } catch (err) {
          console.error(`Error sending customer email for order ${order.id}:`, err)
          errorOccurred = `Customer email failed: ${err.message}`
        }
      }

      // Send to Owner
      if (!ownerSent) {
        try {
          const ownerHtml = getOwnerTemplate(
            order.customer_name || 'Anonymous',
            order.customer_email || 'No email',
            formattedNum,
            ownerItemsHtml,
            totalAmountStr,
            addressStr,
            paymentMethodStr
          )

          await transporter.sendMail({
            from: `LashGlaze Atelier <${fromOwner}>`,
            to: toOwner,
            subject: `NEW ORDER ALERT - #${formattedNum} - ${totalAmountStr}`,
            html: ownerHtml
          })

          ownerSent = true
          await supabase
            .from('orders')
            .update({ owner_email_sent: true })
            .eq('id', order.id)
        } catch (err) {
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

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
