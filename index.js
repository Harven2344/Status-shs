const http = require('http');

const STATUSPAGE_API_KEY = process.env.STATUSPAGE_API_KEY;
const PAGE_ID = '9ndcl9nfpkgy';

// Tes IDs de métriques configurés
const RESEND_METRIC_ID = 'ysyd19697wwl';
const WEBMAIL_METRIC_ID = 'zxr9mp49x68y'; // 👈 Mis à jour avec ton nouvel ID

// Stockage temporaire des résultats pour l'affichage Web
let lastData = {
  resend: { latency: null, status: 'En attente...' },
  webmail: { latency: null, status: 'En attente...' }
};

// Interface Web stylée pour Render
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status Engine — Eza Group</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', sans-serif;
          background: #090d16;
          color: #e2e8f0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        .card {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 16px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .title { font-size: 1.25rem; font-weight: 700; color: #fff; }
        .badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .metric {
          background: #1f2937;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .metric-name { font-weight: 600; font-size: 0.95rem; color: #9ca3af; }
        .metric-value { font-size: 1.1rem; font-weight: 700; color: #60a5fa; }
        .footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.8rem;
          color: #6b7280;
        }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">⚡ Status Engine</div>
          <div class="badge"><div class="dot"></div> RUNNING</div>
        </div>
        
        <div class="metric">
          <div class="metric-name">📬 Resend API</div>
          <div class="metric-value">${lastData.resend.latency ? lastData.resend.latency + ' ms' : 'En cours...'}</div>
        </div>

        <div class="metric">
          <div class="metric-name">🌐 Eza Mail Web</div>
          <div class="metric-value">${lastData.webmail.latency ? lastData.webmail.latency + ' ms' : 'En cours...'}</div>
        </div>

        <div class="footer">
          Pousse vers <a href="https://ezamail.statuspage.io" target="_blank">ezamail.statuspage.io</a><br>
          Fréquence d'actualisation : 5 min
        </div>
      </div>
    </body>
    </html>
  `);
}).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

async function pushMetric(metricId, latency, name) {
  if (!STATUSPAGE_API_KEY) return;

  try {
    const response = await fetch(`https://api.statuspage.io/v1/pages/${PAGE_ID}/metrics/${metricId}/data.json`, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          timestamp: Math.floor(Date.now() / 1000),
          value: latency
        }
      })
    });

    if (response.ok) {
      console.log(`✅ Latence ${name} envoyée : ${latency} ms`);
    } else {
      console.error(`❌ Erreur Statuspage (${name}) :`, await response.json());
    }
  } catch (error) {
    console.error(`❌ Erreur réseau (${name}) :`, error);
  }
}

async function checkAll() {
  // 1. Resend API
  const startResend = Date.now();
  try {
    await fetch('https://api.resend.com/emails', { headers: { 'Authorization': 'Bearer ping' } });
  } catch (e) {}
  const resendLatency = Date.now() - startResend;
  lastData.resend.latency = resendLatency;
  await pushMetric(RESEND_METRIC_ID, resendLatency, 'Resend API');

  // 2. Eza Mail Web
  const startWeb = Date.now();
  try {
    await fetch('https://mail.ezagroup.fr');
  } catch (e) {}
  const webmailLatency = Date.now() - startWeb;
  lastData.webmail.latency = webmailLatency;
  await pushMetric(WEBMAIL_METRIC_ID, webmailLatency, 'Eza Mail Web');
}

checkAll();
setInterval(checkAll, 300000);
