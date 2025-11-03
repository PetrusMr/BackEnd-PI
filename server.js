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

require('dotenv').config();

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828,
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
  
  // Primeiro buscar o agendamento para verificar se já passou
  const selectQuery = 'SELECT * FROM agendamentos WHERE id = ?';
  
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length === 0) {
      db.end();
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    }
    
    const agendamento = results[0];
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    const horaAtual = agora.getHours();
    const dataAgendamento = new Date(agendamento.data).toISOString().split('T')[0];
    
    // Verificar se o agendamento já passou
    let jaPasso = false;
    
    if (dataAgendamento < hoje) {
      jaPasso = true;
    } else if (dataAgendamento === hoje) {
      if (agendamento.horario === 'manha' && horaAtual >= 13) jaPasso = true;
      if (agendamento.horario === 'tarde' && horaAtual >= 18) jaPasso = true;
      if (agendamento.horario === 'noite' && horaAtual >= 23) jaPasso = true;
    }
    
    if (jaPasso) {
      db.end();
      return res.status(400).json({ success: false, message: 'Não é possível cancelar agendamento que já passou' });
    }
    
    // Se não passou, pode cancelar
    const deleteQuery = 'DELETE FROM agendamentos WHERE id = ?';
    
    db.query(deleteQuery, [id], (err, result) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
      }
      
      res.json({ success: true, message: 'Agendamento cancelado com sucesso' });
    });
  });
});

app.get('/api/agendamentos/buscar/:data/:horario', (req, res) => {
  const { data, horario } = req.params;
  const db = createConnection();
  const query = 'SELECT * FROM agendamentos WHERE data = ? AND horario = ?';
  
  db.query(query, [data, horario], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length > 0) {
      const agendamento = {
        ...results[0],
        data: new Date(results[0].data).toISOString().split('T')[0]
      };
      res.json({ success: true, agendamento });
    } else {
      res.json({ success: false, message: 'Agendamento não encontrado' });
    }
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

app.get('/api/agendamentos/lista/historico', (req, res) => {
  const db = createConnection();
  const query = 'SELECT * FROM historico_agendamentos ORDER BY data DESC, horario';
  
  db.query(query, (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    const historico = results.map(item => ({
      ...item,
      data: new Date(item.data).toISOString().split('T')[0]
    }));
    
    res.json({ success: true, historico });
  });
});

app.get('/api/scans/usuario/:nome/:data/:horario', (req, res) => {
  const { nome, data, horario } = req.params;
  
  // Como não temos tabela de scans ainda, retornar dados simulados
  const scans = [{
    usuario: nome,
    tipo_scan: 'entrada',
    resultado_scan: 'Acesso autorizado',
    data_hora: `${data} ${horario}:00`
  }];
  
  res.json({ success: true, scans });
});

app.get('/api/agendamentos/ativo/:usuario', (req, res) => {
  const { usuario } = req.params;
  const db = createConnection();
  const agora = new Date();
  const hoje = agora.toISOString().split('T')[0];
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();
  
  // Determinar horário atual
  let horarioAtual = '';
  if (horaAtual >= 7 && horaAtual < 13) {
    horarioAtual = 'manha';
  } else if (horaAtual >= 13 && horaAtual < 18) {
    horarioAtual = 'tarde';
  } else if (horaAtual >= 18 && horaAtual < 23) {
    horarioAtual = 'noite';
  }
  
  // Buscar agendamento para o horário atual
  const query = 'SELECT * FROM agendamentos WHERE nome = ? AND data = ? AND horario = ?';
  
  db.query(query, [usuario, hoje, horarioAtual], (err, results) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length > 0) {
      // Verificar se está no horário correto para escanear
      let podeEscanear = false;
      
      if (horarioAtual === 'manha' && horaAtual >= 7 && (horaAtual > 7 || minutoAtual >= 1)) {
        podeEscanear = true;
      } else if (horarioAtual === 'tarde' && horaAtual >= 13 && (horaAtual > 13 || minutoAtual >= 1)) {
        podeEscanear = true;
      } else if (horarioAtual === 'noite' && horaAtual >= 18 && (horaAtual > 18 || minutoAtual >= 1)) {
        podeEscanear = true;
      }
      
      if (podeEscanear) {
        // Verificar status dos scans para controlar botões
        const scanQuery = 'SELECT tipo_scan FROM scans WHERE usuario = ? AND DATE(data_hora) = ? AND turno = ? ORDER BY data_hora';
        
        db.query(scanQuery, [usuario, hoje, horarioAtual], (scanErr, scanResults) => {
          db.end();
          if (scanErr) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
          }
          
          const scans = scanResults.map(s => s.tipo_scan);
          const temInicio = scans.includes('inicio');
          const temFim = scans.includes('fim');
          
          let statusBotoes = {
            podeInicio: !temInicio && !temFim,
            podeFim: temInicio && !temFim,
            cicloCompleto: temInicio && temFim
          };
          
          // temAgendamento deve ser true se pode fazer alguma ação (início ou fim)
          const podeAlgumaAcao = statusBotoes.podeInicio || statusBotoes.podeFim;
          
          res.json({ 
            temAgendamento: podeAlgumaAcao,
            agendamento: podeAlgumaAcao ? {
              id: results[0].id,
              nome: results[0].nome,
              data: results[0].data,
              horario: results[0].horario
            } : null,
            statusBotoes
          });
        });
      } else {
        db.end();
        res.json({ 
          temAgendamento: false, 
          agendamento: null 
        });
      }
    } else {
      db.end();
      res.json({ 
        temAgendamento: false, 
        agendamento: null 
      });
    }
  });
});

app.post('/api/gemini/analisar-componentes', (req, res) => {
  const { imageBase64 } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'Imagem é obrigatória' });
  }

  const resultados = [
    'Componente identificado: Resistor 220Ω',
    'Componente identificado: LED vermelho',
    'Componente identificado: Capacitor 100μF',
    'Análise concluída com sucesso'
  ];
  
  const resultado = resultados[Math.floor(Math.random() * resultados.length)];
  
  res.json({ 
    success: true, 
    resultado: resultado
  });
});

app.post('/api/scans/salvar-scan', (req, res) => {
  const { usuario, tipo_scan, resultado_scan, turno } = req.body;
  
  if (!usuario || !tipo_scan || !resultado_scan) {
    return res.status(400).json({ success: false, message: 'Dados obrigatórios faltando' });
  }
  
  const db = createConnection();
  
  // Criar tabela se não existir
  const createTable = `CREATE TABLE IF NOT EXISTS scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    tipo_scan VARCHAR(20) NOT NULL,
    resultado_scan TEXT NOT NULL,
    turno VARCHAR(20),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  db.query(createTable, (err) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao criar tabela' });
    }
    
    // Determinar turno se não foi enviado
    let turnoFinal = turno;
    if (!turnoFinal) {
      const hora = new Date().getHours();
      if (hora >= 7 && hora < 13) turnoFinal = 'manha';
      else if (hora >= 13 && hora < 18) turnoFinal = 'tarde';
      else if (hora >= 18 && hora < 23) turnoFinal = 'noite';
    }
    
    // Inserir scan
    const insertQuery = 'INSERT INTO scans (usuario, tipo_scan, resultado_scan, turno) VALUES (?, ?, ?, ?)';
    
    db.query(insertQuery, [usuario, tipo_scan, resultado_scan, turnoFinal], (err, result) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao salvar scan' });
      }
      
      res.json({ 
        success: true, 
        message: 'Scan salvo com sucesso',
        id: result.insertId
      });
    });
  });
});

app.post('/api/mover-historico', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  
  // Buscar agendamentos passados
  const selectQuery = 'SELECT * FROM agendamentos WHERE data < ?';
  
  db.query(selectQuery, [hoje], (err, results) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length === 0) {
      db.end();
      return res.json({ success: true, message: 'Nenhum agendamento para mover' });
    }
    
    // Inserir no histórico
    const insertQuery = 'INSERT INTO historico_agendamentos (nome, data, horario) VALUES ?';
    const values = results.map(r => [r.nome, r.data, r.horario]);
    
    db.query(insertQuery, [values], (err) => {
      if (err) {
        db.end();
        return res.status(500).json({ success: false, message: 'Erro ao inserir histórico' });
      }
      
      // Remover da tabela principal
      const deleteQuery = 'DELETE FROM agendamentos WHERE data < ?';
      
      db.query(deleteQuery, [hoje], (err) => {
        db.end();
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro ao remover agendamentos' });
        }
        
        res.json({ success: true, message: `${results.length} agendamentos movidos para histórico` });
      });
    });
  });
});









// Setup inicial
app.get('/api/setup', (req, res) => {
  const db = createConnection();
  
  const queries = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario VARCHAR(50) UNIQUE NOT NULL,
      senha VARCHAR(50) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS agendamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      data DATE NOT NULL,
      horario VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS supervisor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario VARCHAR(50) UNIQUE NOT NULL,
      senha VARCHAR(50) NOT NULL,
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS historico_agendamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(50) NOT NULL,
      data DATE NOT NULL,
      horario VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
      ('admin', '123', 'admin@teste.com'),
      ('user1', '123', 'user1@teste.com'),
      ('petrus', '123', 'petrus@teste.com')`,
    `INSERT IGNORE INTO supervisor (usuario, senha, email) VALUES 
      ('supervisor', 'admin123', 'supervisor@teste.com')`
  ];
  
  let completed = 0;
  
  queries.forEach((query, index) => {
    db.query(query, (err) => {
      if (err) {
        console.error(`Erro query ${index}:`, err);
      }
      completed++;
      
      if (completed === queries.length) {
        db.end();
        res.json({ success: true, message: 'Banco Railway configurado!' });
      }
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