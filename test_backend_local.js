const fetch = require('node-fetch');

async function testarBackendLocal() {
  const imagemTeste = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  try {
    console.log('🧪 Testando backend local...');
    const response = await fetch('http://localhost:3000/api/gemini/analisar-componentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imagemTeste })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', data);
    
    if (data.success) {
      console.log('✅ FUNCIONOU! Resultado:', data.resultado);
    } else {
      console.log('❌ Falhou:', data.error);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testarBackendLocal();