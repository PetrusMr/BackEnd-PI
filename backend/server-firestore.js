require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { usuarios, agendamentos, historicoAgendamentos, scans } = require('./firestore-operations');

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rota raiz
app.get('/', (req, res) => {
  console.log('🚀 Servidor Firestore rodando:', new Date().toISOString());
  res.json({ 
    message: 'Servidor EasyControl com Firestore', 
    timestamp: new Date().toISOString()
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    
    if (!usuario || !senha) {
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
    }
    
    const user = await usuarios.login(usuario, senha);
    
    if (user) {
      res.json({ success: true, message: 'Login realizado com sucesso' });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Agendamentos por usuário
app.get('/api/agendamentos/usuario/:nome', async (req, res) => {
  try {
    const { nome } = req.params;
    const userAgendamentos = await agendamentos.getByUser(nome);
    
    res.json({ success: true, agendamentos: userAgendamentos });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Criar agendamento
app.post('/api/agendamentos', async (req, res) => {
  try {
    const agendamentoData = req.body;
    const id = await agendamentos.create(agendamentoData);
    
    res.json({ success: true, id, message: 'Agendamento criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Histórico
app.get('/api/historico-reservas', async (req, res) => {
  try {
    const historico = await historicoAgendamentos.getByUser('all'); // Implementar getAll
    res.json({ success: true, historico });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Scans
app.post('/api/scans', async (req, res) => {
  try {
    const scanData = req.body;
    const id = await scans.create(scanData);
    
    res.json({ success: true, id, message: 'Scan registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar scan:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

const server = app.listen(process.env.PORT || port, () => {
  console.log(`🔥 Servidor Firestore rodando na porta ${process.env.PORT || port}`);
});

module.exports = app;