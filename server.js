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

app.listen(PORT, () => {
  console.log(`🚀 Servidor Railway rodando na porta ${PORT}`);
});

module.exports = app;