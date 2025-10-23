require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { usuarios, agendamentos, historicoAgendamentos, scans } = require('./firestore-operations');
const { db } = require('./firebase-config');

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

// Debug Firebase
app.get('/api/debug', async (req, res) => {
  try {
    console.log('🔧 Debug Firebase - Variáveis:');
    console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NÃO DEFINIDA');
    console.log('CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NÃO DEFINIDA');
    console.log('PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');
    
    // Testar conexão
    const testDoc = await db.collection('test').add({
      message: 'Teste Vercel',
      timestamp: new Date()
    });
    
    // Buscar usuários
    const usuariosSnapshot = await db.collection('usuarios').get();
    const usuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, usuario: doc.data().usuario }));
    
    await db.collection('test').doc(testDoc.id).delete();
    
    res.json({
      success: true,
      firebase_vars: {
        project_id: process.env.FIREBASE_PROJECT_ID || 'NÃO DEFINIDA',
        client_email: process.env.FIREBASE_CLIENT_EMAIL || 'NÃO DEFINIDA',
        private_key_exists: !!process.env.FIREBASE_PRIVATE_KEY
      },
      usuarios_encontrados: usuarios.length,
      usuarios: usuarios
    });
  } catch (error) {
    console.error('❌ Erro debug:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      firebase_vars: {
        project_id: process.env.FIREBASE_PROJECT_ID || 'NÃO DEFINIDA',
        client_email: process.env.FIREBASE_CLIENT_EMAIL || 'NÃO DEFINIDA',
        private_key_exists: !!process.env.FIREBASE_PRIVATE_KEY
      }
    });
  }
});

// Criar usuários de exemplo
app.post('/api/setup', async (req, res) => {
  try {
    // Verificar se já existem usuários
    const usuariosSnapshot = await db.collection('usuarios').get();
    
    if (usuariosSnapshot.empty) {
      // Criar usuários de exemplo
      await db.collection('usuarios').add({
        usuario: 'admin',
        senha: '123',
        email: 'admin@teste.com',
        created_at: new Date()
      });
      
      await db.collection('usuarios').add({
        usuario: 'user1',
        senha: 'pass1',
        email: 'user1@teste.com',
        created_at: new Date()
      });
      
      res.json({ success: true, message: 'Usuários criados com sucesso!' });
    } else {
      res.json({ success: true, message: 'Usuários já existem', count: usuariosSnapshot.size });
    }
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

// Todas as reservas
app.get('/api/agendamentos/todas', async (req, res) => {
  try {
    const snapshot = await db.collection('agendamentos').orderBy('data').get();
    const reservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, reservas });
  } catch (error) {
    console.error('Erro ao buscar todas as reservas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Cancelar agendamento
app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('agendamentos').doc(id).delete();
    res.json({ success: true, message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Histórico
app.get('/api/historico-reservas', async (req, res) => {
  try {
    const snapshot = await db.collection('historico_agendamentos').orderBy('created_at', 'desc').get();
    const historico = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, historico });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Verificar agendamento ativo
app.get('/api/agendamentos/ativo/:nome', async (req, res) => {
  try {
    const { nome } = req.params;
    const hoje = new Date().toISOString().split('T')[0];
    const hora = new Date().getHours();
    
    let horarioAtual = '';
    if (hora >= 7 && hora < 13) horarioAtual = 'manha';
    else if (hora >= 13 && hora < 18) horarioAtual = 'tarde';
    else if (hora >= 18 && hora < 23) horarioAtual = 'noite';
    
    const snapshot = await db.collection('agendamentos')
      .where('nome', '==', nome)
      .where('data', '==', hoje)
      .where('horario', '==', horarioAtual)
      .get();
    
    const temAgendamento = !snapshot.empty;
    const agendamento = temAgendamento ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
    
    res.json({ temAgendamento, agendamento });
  } catch (error) {
    console.error('Erro ao verificar agendamento ativo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Login supervisor
app.post('/api/login-supervisor', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    
    // Verificar se existe na tabela usuarios (não deve existir)
    const userSnapshot = await db.collection('usuarios').where('usuario', '==', usuario).get();
    if (!userSnapshot.empty) {
      return res.status(401).json({ success: false, message: 'Acesso negado: usuário não é supervisor' });
    }
    
    // Verificar na tabela supervisor
    const supervisorSnapshot = await db.collection('supervisor')
      .where('usuario', '==', usuario)
      .where('senha', '==', senha)
      .get();
    
    if (!supervisorSnapshot.empty) {
      res.json({ success: true, message: 'Login de supervisor realizado com sucesso' });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro no login supervisor:', error);
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

// Buscar scans por usuário
app.get('/api/scans/usuario/:nome/:data/:turno', async (req, res) => {
  try {
    const { nome, data, turno } = req.params;
    
    const snapshot = await db.collection('scans')
      .where('usuario', '==', nome)
      .get();
    
    const scansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (scansData.length === 0) {
      res.json({ 
        success: true, 
        scans: [{ 
          usuario: nome, 
          tipo_scan: 'nenhum', 
          resultado_scan: 'Não scaneado', 
          data_hora: data + ' 00:00:00' 
        }] 
      });
    } else {
      res.json({ success: true, scans: scansData });
    }
  } catch (error) {
    console.error('Erro ao buscar scans:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

const server = app.listen(process.env.PORT || port, () => {
  console.log(`🔥 Servidor Firestore rodando na porta ${process.env.PORT || port}`);
});

module.exports = app;