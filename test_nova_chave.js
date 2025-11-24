const fetch = require('node-fetch');

async function testarNovaChave() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCjKgbMAcEN77d23aupzTJxFcwnY7Libqw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Diga apenas: FUNCIONOU" }] }]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    
    if (data.error) {
      console.log('❌ ERRO:', data.error.message);
    } else {
      console.log('✅ NOVA CHAVE FUNCIONANDO!');
      console.log('Resposta:', data.candidates[0].content.parts[0].text);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testarNovaChave();