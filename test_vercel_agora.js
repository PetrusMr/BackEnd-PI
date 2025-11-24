const fetch = require('node-fetch');

async function testarVercel() {
  const imagemTeste = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    console.log('🧪 Testando Vercel com nova chave...');
    const response = await fetch('https://back-end-pi-dypp.vercel.app/api/gemini/analisar-componentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imagemTeste })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ FUNCIONOU!');
    } else {
      console.log('❌ Ainda com erro:', data.error || data.message);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testarVercel();