require('dotenv').config();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log('API Key:', GEMINI_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');

async function testarGemini() {
  try {
    // Teste simples sem imagem
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Diga apenas 'API funcionando'"
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API Gemini funcionando!');
    console.log('Resposta:', response.data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    console.error('❌ Erro na API Gemini:');
    console.error('Status:', error.response?.status);
    console.error('Dados:', error.response?.data);
    console.error('Mensagem:', error.message);
  }
}

testarGemini();