const STATUSPAGE_API_KEY = process.env.STATUSPAGE_API_KEY;
const PAGE_ID = '9ndcl9nfpkgy';
const METRIC_ID = '30h0vls415dg';

async function updateResendMetric() {
  if (!STATUSPAGE_API_KEY) {
    console.error("❌ Variable STATUSPAGE_API_KEY manquante dans Render !");
    return;
  }

  const startTime = Date.now();

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ping' }
    });
  } catch (err) {
    // Erreur d'auth ignorée, seul le temps de réponse HTTP nous intéresse
  }

  const latency = Date.now() - startTime;
  const currentTimestamp = Math.floor(Date.now() / 1000);

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

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Latence Resend envoyée avec succès : ${latency} ms`);
    } else {
      console.error('❌ Erreur Statuspage :', data);
    }
  } catch (error) {
    console.error('❌ Erreur réseau :', error);
  }
}

// Envoi immédiat au démarrage
updateResendMetric();

// Boucle toutes les 5 minutes (300 000 ms)
setInterval(updateResendMetric, 300000);
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
