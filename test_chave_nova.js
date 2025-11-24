const fetch = require('node-fetch');

async function testarChaveNova() {
  const chave = 'AIzaSyDGxQETDz0GBe9Sy4Uz6BuSwqhPceHmK-Y';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${chave}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Conte quantos números você vê: 1 2 3"
          }]
        }]
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ ERRO:', data.error.message);
      if (data.error.message.includes('leaked')) {
        console.log('🚨 CHAVE VAZADA! Precisa gerar nova chave.');
      }
    } else {
      console.log('✅ FUNCIONOU!');
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testarChaveNova();