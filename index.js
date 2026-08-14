const http = require('http');

// Serveur HTTP pour que Render garde le service actif
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Statuspage pusher is running!\n');
}).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const STATUSPAGE_API_KEY = process.env.STATUSPAGE_API_KEY;
const PAGE_ID = '9ndcl9nfpkgy';

// Les IDs de tes métriques Statuspage
const RESEND_METRIC_ID = 'ysyd19697wwl';
const WEBMAIL_METRIC_ID = 'zxr9mp49x68y'; // 👈 Remplace par le nouvel ID copié à l'étape 1

// Fonction générique d'envoi vers Statuspage
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

// Routine de vérification globale
async function checkAll() {
  // 1. Test de l'API Resend
  const startResend = Date.now();
  try {
    await fetch('https://api.resend.com/emails', { headers: { 'Authorization': 'Bearer ping' } });
  } catch (e) {}
  await pushMetric(RESEND_METRIC_ID, Date.now() - startResend, 'Resend API');

  // 2. Test du Webmail Eza Mail
  const startWeb = Date.now();
  try {
    await fetch('https://mail.ezagroup.fr'); // URL de ton webmail
  } catch (e) {}
  await pushMetric(WEBMAIL_METRIC_ID, Date.now() - startWeb, 'Eza Mail Web');
}

// Lancement immédiat puis toutes les 5 minutes
checkAll();
setInterval(checkAll, 300000);
