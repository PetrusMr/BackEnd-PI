const fetch = require('node-fetch');

async function testarGeminiMelhorado() {
  console.log('🧪 Testando API Gemini melhorada...');
  
  // Imagem de teste simples (1x1 pixel transparente)
  const imagemTeste = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    console.log('📤 Enviando requisição...');
    const response = await fetch('https://back-end-pi-dypp.vercel.app/api/gemini/analisar-componentes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: imagemTeste
      })
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', response.headers.raw());
    
    const data = await response.json();
    console.log('📋 Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Sucesso! Resultado:', data.resultado);
    } else {
      console.log('❌ Falha:', data.error);
      console.log('📝 Resultado retornado:', data.resultado);
    }
    
  } catch (error) {
    console.error('💥 Erro na requisição:', error.message);
    console.error('📍 Stack:', error.stack);
  }
}

// Teste direto com a API do Google
async function testarGeminiDireto() {
  console.log('\n🔬 Testando API Gemini diretamente...');
  
  const GEMINI_API_KEY = 'AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0';
  const imagemTeste = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analise esta imagem e identifique componentes eletrônicos visíveis. Se não houver componentes, responda: 'Nenhum componente eletrônico identificado'"
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: imagemTeste
              }
            }
          ]
        }]
      })
    });

    console.log('📊 Status direto:', response.status);
    const data = await response.json();
    console.log('📋 Resposta direta:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('💥 Erro direto:', error.message);
  }
}

// Executar testes
async function executarTestes() {
  await testarGeminiMelhorado();
  await testarGeminiDireto();
}

executarTestes();