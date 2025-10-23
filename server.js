const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Usuários para teste
const usuarios = [
  { usuario: 'admin', senha: '123' },
  { usuario: 'user1', senha: 'pass1' },
  { usuario: 'petrus', senha: '123' }
];

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 RAILWAY FUNCIONANDO! EasyControl API', 
    timestamp: new Date().toISOString(),
    status: 'ONLINE',
    usuarios_disponiveis: usuarios.map(u => u.usuario)
  });
});

// Login
app.post('/api/login', (req, res) => {
  console.log('Login recebido:', req.body);
  const { usuario, senha } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
  }
  
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  
  if (user) {
    console.log('✅ Login sucesso:', usuario);
    res.json({ success: true, message: 'Login realizado com sucesso' });
  } else {
    console.log('❌ Login falhou:', usuario);
    res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
  }
});

// Teste
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API RAILWAY FUNCIONANDO!',
    usuarios: usuarios.map(u => u.usuario),
    timestamp: new Date().toISOString()
  });
});

// Histórico (mock)
app.get('/api/historico-reservas', (req, res) => {
  res.json({
    success: true,
    historico: [
      { nome: 'admin', data: '2024-12-20', horario: 'manha' },
      { nome: 'user1', data: '2024-12-19', horario: 'tarde' }
    ]
  });
});

// Gemini Vision API
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;
    
    if (!image || !prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Imagem e prompt são obrigatórios' 
      });
    }

    const geminiApiKey = 'AIzaSyDRqQaQ2qzRjhQpMQHZg9rFxljBOisRdHs';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: image.replace(/^data:image\/[a-z]+;base64,/, '')
            }
          }
        ]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const result = data.candidates[0].content.parts[0].text;
      res.json({ success: true, result });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Erro na análise da imagem',
        error: data 
      });
    }
  } catch (error) {
    console.error('Erro Gemini:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Railway rodando na porta ${PORT}`);
});

module.exports = app;