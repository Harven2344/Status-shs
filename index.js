const STATUSPAGE_API_KEY = process.env.STATUSPAGE_API_KEY;
const PAGE_ID = '9ndcl9nfpkgy';
const METRIC_ID = '30h0vls415dg';

async function updateResendMetric() {
  if (!STATUSPAGE_API_KEY) {
    console.error("❌ Variable STATUSPAGE_API_KEY manquante !");
    return;
  }

  const startTime = Date.now();

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ping' }
    });
  } catch (err) {
    // Erreur d'auth ignorée
  }

  const latency = Date.now() - startTime;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  try {
    const response = await fetch(`https://api.statuspage.io/v1/pages/${PAGE_ID}/metrics/${METRIC_ID}/data.json`, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          timestamp: currentTimestamp,
          value: latency
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Latence Resend envoyée : ${latency} ms`);
    } else {
      console.error('❌ Erreur Statuspage :', data);
    }
  } catch (error) {
    console.error('❌ Erreur réseau :', error);
  }
}

updateResendMetric();
setInterval(updateResendMetric, 300000);
