async function testarChaveGemini() {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Teste simples: conte quantos números você vê: 1 2 3"
          }]
        }]
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Resposta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  }
}

testarChaveGemini();