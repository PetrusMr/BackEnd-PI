const fetch = require('node-fetch');

async function testarGemini() {
  try {
    const response = await fetch('https://back-end-pi-dypp.vercel.app/api/gemini/analisar-componentes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', data);
  } catch (error) {
    console.error('Erro:', error);
  }
}

testarGemini();