import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async () => {
  try {
    // Use WIB timezone (UTC+7)
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    const dayOfMonth = today.getDate()

    // Get all active reminders for today's date
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('remind_day', dayOfMonth)
      .eq('is_active', true)

    if (error) throw error
    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders today', sent: 0 }), { status: 200 })
    }

    let sent = 0
    const errors = []

    for (const reminder of reminders) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f2ff; margin: 0; padding: 0; }
              .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(124,92,252,0.08); }
              .header { background: linear-gradient(135deg, #7c5cfc, #a78bfa); padding: 32px 32px 24px; }
              .header h1 { color: #fff; font-size: 22px; margin: 0 0 4px; }
              .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0; }
              .body { padding: 28px 32px; }
              .reminder-card { background: #f4f2ff; border: 1px solid rgba(124,92,252,0.2); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
              .reminder-title { font-size: 18px; font-weight: 700; color: #1a1730; margin-bottom: 8px; }
              .reminder-amount { font-size: 28px; font-weight: 800; color: #7c5cfc; margin-bottom: 4px; font-family: monospace; }
              .reminder-cat { font-size: 12px; color: #6b6585; background: #e8e4ff; padding: 3px 10px; border-radius: 99px; display: inline-block; }
              .reminder-notes { font-size: 13px; color: #6b6585; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(124,92,252,0.15); }
              .footer { padding: 20px 32px; background: #f9f8ff; border-top: 1px solid #ede9ff; font-size: 12px; color: #a09bb8; text-align: center; }
              .btn { display: inline-block; background: linear-gradient(135deg, #7c5cfc, #a78bfa); color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
              .date-badge { background: #fff; border: 1px solid rgba(124,92,252,0.2); border-radius: 8px; padding: 8px 14px; display: inline-block; font-size: 13px; color: #7c5cfc; font-weight: 600; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Smart Money Manager</h1>
                <p>Payment reminder for today</p>
              </div>
              <div class="body">
                <div class="date-badge">
                  📅 ${today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div class="reminder-card">
                  <div class="reminder-title">${reminder.title}</div>
                  ${reminder.amount ? `<div class="reminder-amount">Rp ${Number(reminder.amount).toLocaleString('id-ID')}</div>` : ''}
                  <span class="reminder-cat">${reminder.category || 'General'}</span>
                  ${reminder.description ? `<div class="reminder-notes">📝 ${reminder.description}</div>` : ''}
                </div>
                <p style="font-size: 14px; color: #6b6585; line-height: 1.6;">
                  This is your scheduled reminder to handle this payment. Don't forget to log it in your Smart Money Manager after paying!
                </p>
                <a href="https://smart-money-manager-ecru.vercel.app/transactions" class="btn">
                  Log this transaction →
                </a>
              </div>
              <div class="footer">
                Smart Money Manager · You're receiving this because you set up a reminder.<br/>
                To stop this reminder, log in and deactivate it in the Reminders page.
              </div>
            </div>
          </body>
        </html>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Smart Money Manager <onboarding@resend.dev>',
          to: [reminder.remind_email],
          subject: `⏰ Reminder: ${reminder.title}${reminder.amount ? ` - Rp ${Number(reminder.amount).toLocaleString('id-ID')}` : ''}`,
          html: emailHtml,
        }),
      })

      if (res.ok) {
        sent++
      } else {
        const err = await res.json()
        errors.push({ id: reminder.id, error: err })
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${sent}/${reminders.length} reminders`, sent, errors }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
