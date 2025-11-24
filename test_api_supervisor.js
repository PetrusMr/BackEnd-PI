const fetch = require('node-fetch');

async function testarAPISupervisor() {
  try {
    console.log('🔍 Testando API de login supervisor...');
    
    const response = await fetch('http://localhost:3000/api/login-supervisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario: 'admin',
        senha: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Resposta:', data);

    if (data.success) {
      console.log('✅ Login supervisor funcionou!');
    } else {
      console.log('❌ Login supervisor falhou:', data.message);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testarAPISupervisor();