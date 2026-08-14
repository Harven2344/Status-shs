const STATUSPAGE_API_KEY = process.env.STATUSPAGE_API_KEY;
const PAGE_ID = '9ndcl9nfpkgy';
const METRIC_ID = '30h0vls415dg';


async function updateResendMetric() {
  if (!STATUSPAGE_API_KEY) {
    console.error("❌ Erreur : La variable STATUSPAGE_API_KEY n'est pas définie dans l'environnement !");
    return;
  }

  const startTime = Date.now();

  // 1. Tester la latence de Resend
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ping' }
    });
  } catch (err) {
    // On ignore l'erreur d'authentification : seul le temps de réponse HTTP nous intéresse
  }

  const latency = Date.now() - startTime;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // 2. Envoyer la mesure à Statuspage
  try {
    const response = await fetch(`https://api.statuspage.io/v1/pages/${PAGE_ID}/metrics/${METRIC_ID}/data.json`, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${STATUSPAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          timestamp: currentTimestamp,
          value: latency
        }
      })
    });

    if (response.ok) {
      console.log(`✅ Latence Resend envoyée avec succès : ${latency} ms`);
    } else {
      const errorData = await response.json();
      console.error('❌ Erreur Statuspage :', errorData);
    }
  } catch (error) {
    console.error('❌ Erreur réseau :', error);
  }
}

// Lancement immédiat
updateResendMetric();
