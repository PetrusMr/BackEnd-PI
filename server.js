const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'sql10804387',
  password: 'PfvDQC2YPa',
  database: 'sql10804387',
  port: 3306,
  acquireTimeout: 60000,
  timeout: 60000
};

function createConnection() {
  return mysql.createConnection(dbConfig);
}



// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor EasyControl rodando', 
    timestamp: new Date().toISOString(),
    status: 'ONLINE',
    database: 'MYSQL'
  });
});



// Login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
  }
  
  const db = createConnection();
  const query = 'SELECT * FROM usuarios WHERE usuario = ? AND senha = ?';
  
  db.query(query, [usuario, senha], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length > 0) {
      res.json({ success: true, message: 'Login realizado com sucesso' });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  });
});

// Login supervisor
app.post('/api/login-supervisor', (req, res) => {
  const { usuario, senha } = req.body;
  
  const db = createConnection();
  
  // Criar tabela supervisor se não existir
  const createSupervisor = `CREATE TABLE IF NOT EXISTS supervisor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  db.query(createSupervisor, (err) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    // Inserir supervisor padrão
    const insertSupervisor = `INSERT IGNORE INTO supervisor (usuario, senha, email) VALUES ('supervisor', 'admin123', 'supervisor@teste.com')`;
    
    db.query(insertSupervisor, (err) => {
      if (err) {
        db.end();
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
      }
      
      // Verificar login
      const query = 'SELECT * FROM supervisor WHERE usuario = ? AND senha = ?';
      db.query(query, [usuario, senha], (err, results) => {
        db.end();
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (results.length > 0) {
          res.json({ success: true, message: 'Login de supervisor realizado com sucesso' });
        } else {
          res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
        }
      });
    });
  });
});

// Teste
app.get('/api/test', (req, res) => {
  const db = createConnection();
  const query = 'SELECT usuario FROM usuarios';
  
  db.query(query, (err, results) => {
    db.end();
    if (err) {
      return res.json({ 
        success: false, 
        message: 'Erro no banco',
        timestamp: new Date().toISOString()
      });
    }
    
    const usuarios = results.map(row => row.usuario);
    res.json({ 
      success: true, 
      message: 'API VERCEL + MYSQL FUNCIONANDO!',
      usuarios: usuarios,
      timestamp: new Date().toISOString()
    });
  });
});

// Agendamentos
app.get('/api/agendamentos/usuario/:nome', (req, res) => {
  const { nome } = req.params;
  const db = createConnection();
  const query = 'SELECT * FROM agendamentos WHERE nome = ? ORDER BY data, horario';
  
  db.query(query, [nome], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    const agendamentos = results.map(agendamento => ({
      ...agendamento,
      data: new Date(agendamento.data).toISOString().split('T')[0]
    }));
    
    res.json({ success: true, agendamentos });
  });
});

app.get('/api/agendamentos/:data', (req, res) => {
  const { data } = req.params;
  const db = createConnection();
  const query = 'SELECT horario FROM agendamentos WHERE data = ?';
  
  db.query(query, [data], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    const horarios = results.map(row => row.horario);
    res.json({ success: true, horarios });
  });
});

app.post('/api/agendamentos', (req, res) => {
  const { nome, data, horario } = req.body;
  
  if (!nome || !data || !horario) {
    return res.status(400).json({ success: false, message: 'Nome, data e horário são obrigatórios' });
  }
  
  const db = createConnection();
  const checkQuery = 'SELECT COUNT(*) as count FROM agendamentos WHERE data = ? AND horario = ?';
  
  db.query(checkQuery, [data, horario], (err, results) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results[0].count > 0) {
      db.end();
      return res.status(400).json({ success: false, message: 'Horário já ocupado' });
    }
    
    const insertQuery = 'INSERT INTO agendamentos (nome, data, horario) VALUES (?, ?, ?)';
    
    db.query(insertQuery, [nome, data, horario], (err, result) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
      }
      
      res.json({ success: true, message: 'Agendamento salvo com sucesso', id: result.insertId });
    });
  });
});

app.delete('/api/agendamentos/:id', (req, res) => {
  const { id } = req.params;
  const db = createConnection();
  const query = 'DELETE FROM agendamentos WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    res.json({ success: true, message: 'Agendamento cancelado com sucesso' });
  });
});

app.get('/api/reservas', (req, res) => {
  const db = createConnection();
  const query = 'SELECT * FROM agendamentos ORDER BY data, horario';
  
  db.query(query, (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const reservas = results
      .filter(reserva => {
        const dataReserva = new Date(reserva.data);
        return dataReserva >= hoje;
      })
      .map(reserva => ({
        ...reserva,
        data: new Date(reserva.data).toISOString().split('T')[0]
      }));
    
    res.json({ success: true, reservas });
  });
});









// Setup inicial
app.get('/api/setup', (req, res) => {
  const db = createConnection();
  
  const query1 = `CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  db.query(query1, (err) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro tabela usuarios', error: err.message });
    }
    
    const query2 = `CREATE TABLE IF NOT EXISTS agendamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      data DATE NOT NULL,
      horario VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    db.query(query2, (err) => {
      if (err) {
        db.end();
        return res.status(500).json({ success: false, message: 'Erro tabela agendamentos', error: err.message });
      }
      
      const query3 = `INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
        ('admin', '123', 'admin@teste.com'),
        ('user1', '123', 'user1@teste.com')`;
      
      db.query(query3, (err) => {
        db.end();
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro inserir dados', error: err.message });
        }
        
        res.json({ success: true, message: 'Banco configurado!' });
      });
    });
  });
});



// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Usando MySQL como banco de dados`);
  });
}

// Para Vercel
module.exports = app;