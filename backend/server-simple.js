require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Usuários hardcoded para teste
const usuarios = [
  { usuario: 'admin', senha: '123' },
  { usuario: 'user1', senha: 'pass1' },
  { usuario: 'petrus', senha: '123' }
];

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor EasyControl funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Login simples
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

// Teste simples
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando!',
    usuarios: usuarios.map(u => u.usuario)
  });
});

module.exports = app;