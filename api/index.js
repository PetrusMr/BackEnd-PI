const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Usuários hardcoded
const usuarios = [
  { usuario: 'admin', senha: '123' },
  { usuario: 'user1', senha: 'pass1' },
  { usuario: 'petrus', senha: '123' }
];

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'FUNCIONOU! Servidor EasyControl OK!', 
    timestamp: new Date().toISOString(),
    status: 'SUCESSO'
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
  }
  
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  
  if (user) {
    res.json({ success: true, message: 'Login realizado com sucesso' });
  } else {
    res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
  }
});

// Teste
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API FUNCIONANDO!',
    usuarios: usuarios.map(u => u.usuario)
  });
});

// Gemini - Análise de componentes
app.post('/api/gemini/analisar-componentes', async (req, res) => {
  const { imageBase64 } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'Imagem é obrigatória' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.json({ 
      success: false, 
      resultado: 'Chave API não configurada no Vercel'
    });
  }

  try {
    const fetch = require('node-fetch');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analise esta imagem e identifique componentes eletrônicos visíveis. Para cada item encontrado, conte quantos você vê e liste no formato:\nX nome_do_componente\n\nExemplos:\n2 resistores\n1 led vermelho\n3 fios\n\nSe não houver componentes, responda: 'Nenhum componente eletrônico identificado'"
            },
            {
              inline_data: {
                mime_type: imageBase64.startsWith('/9j/') ? "image/jpeg" : "image/png",
                data: imageBase64
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.json({ 
        success: false, 
        resultado: 'Erro na API Gemini: ' + data.error.message
      });
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const resultado = data.candidates[0].content.parts[0].text;
      res.json({ success: true, resultado: resultado.trim() });
    } else {
      res.json({ success: false, resultado: 'Nenhum componente identificado' });
    }
  } catch (error) {
    res.json({ 
      success: false, 
      resultado: 'Erro ao analisar imagem: ' + error.message
    });
  }
});

module.exports = app;