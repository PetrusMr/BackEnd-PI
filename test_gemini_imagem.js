async function testarGeminiComImagem() {
  // Imagem base64 de teste (1x1 pixel vermelho)
  const imagemTeste = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analise esta imagem e conte EXATAMENTE quantos de cada item você vê. Retorne APENAS uma lista no formato:\n\nX nome_do_item\nY outro_item\n\nExemplos:\n2 resistores\n4 leds\n1 capacitor\n3 fios\n\nFoque em componentes eletrônicos, ferramentas e objetos visíveis. Seja preciso na contagem."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imagemTeste
              }
            }
          ]
        }]
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const resultado = data.candidates[0].content.parts[0].text;
      console.log('✅ Resultado:', resultado);
    } else {
      console.log('❌ Resposta completa:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarGeminiComImagem();