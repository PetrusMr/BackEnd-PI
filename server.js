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
  host: 'switchyard.proxy.rlwy.net',
  user: 'root',
  password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
  database: 'railway',
  port: 41445
};

function createConnection() {
  return mysql.createConnection(dbConfig);
}

// Função para mover agendamentos expirados para histórico automaticamente
function moverAgendamentosExpirados() {
  const db = createConnection();
  const agora = new Date();
  const hoje = agora.toISOString().split('T')[0];
  const horaAtual = agora.getHours();
  
  console.log(`🕐 Verificando agendamentos expirados - ${hoje} ${horaAtual}:00`);
  
  // Criar tabela histórico se não existir
  const createHistoricoTable = `CREATE TABLE IF NOT EXISTS historico_agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    horario VARCHAR(20) NOT NULL,
    data_movido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  db.query(createHistoricoTable, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela histórico:', err);
      db.end();
      return;
    }
    
    // Buscar agendamentos que já passaram do horário
    const minutoAtual = agora.getMinutes();
    const selectQuery = `SELECT * FROM agendamentos WHERE 
      data < ? OR 
      (data = ? AND (
        (horario = 'manha' AND ? > 12) OR
        (horario = 'tarde' AND (? > 17 OR (? = 17 AND ? >= 45))) OR
        (horario = 'noite' AND ? > 22)
      ))`;
    
    db.query(selectQuery, [hoje, hoje, horaAtual, horaAtual, horaAtual, minutoAtual, horaAtual], (err, results) => {
      if (err) {
        console.error('❌ Erro ao buscar agendamentos expirados:', err);
        db.end();
        return;
      }
      
      if (results.length > 0) {
        console.log(`📊 Encontrados ${results.length} agendamentos para mover:`);
        results.forEach(r => {
          console.log(`- ${r.nome} | ${new Date(r.data).toISOString().split('T')[0]} | ${r.horario}`);
        });
        
        // Inserir no histórico com data corrigida
        const insertQuery = 'INSERT INTO historico_agendamentos (nome, data, horario) VALUES ?';
        const values = results.map(r => [r.nome, hoje, r.horario]);
        
        db.query(insertQuery, [values], (err) => {
          if (err) {
            console.error('❌ Erro ao inserir no histórico:', err);
            db.end();
            return;
          }
          
          // Remover da tabela principal
          const ids = results.map(r => r.id);
          const deleteQuery = `DELETE FROM agendamentos WHERE id IN (${ids.map(() => '?').join(',')})`;
          
          db.query(deleteQuery, ids, (err) => {
            db.end();
            if (err) {
              console.error('❌ Erro ao remover agendamentos:', err);
            } else {
              console.log(`✅ ${results.length} agendamentos movidos para histórico`);
            }
          });
        });
      } else {
        console.log('ℹ️ Nenhum agendamento expirado encontrado');
        db.end();
      }
    });
  });
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
      const minutoAtual = agora.getMinutes();
      if (agendamento.horario === 'manha' && horaAtual > 12) jaPasso = true;
      if (agendamento.horario === 'tarde' && (horaAtual > 17 || (horaAtual === 17 && minutoAtual >= 45))) jaPasso = true;
      if (agendamento.horario === 'noite' && horaAtual > 22) jaPasso = true;
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

  // Simulação de análise de componentes com diferentes cenários
  const analises = [
    {
      componentes: [
        { nome: 'Resistor', valor: '220Ω', quantidade: 2 },
        { nome: 'LED', valor: '5mm', quantidade: 1 },
        { nome: 'Capacitor', valor: '100μF', quantidade: 1 }
      ]
    },
    {
      componentes: [
        { nome: 'Resistor', valor: '1kΩ', quantidade: 3 },
        { nome: 'Transistor', valor: 'BC547', quantidade: 1 },
        { nome: 'Capacitor', valor: '22pF', quantidade: 2 }
      ]
    },
    {
      componentes: [
        { nome: 'Resistor', valor: '470Ω', quantidade: 1 },
        { nome: 'LED', valor: '3mm', quantidade: 2 },
        { nome: 'Diodo', valor: '1N4007', quantidade: 1 },
        { nome: 'Capacitor', valor: '10μF', quantidade: 1 }
      ]
    },
    {
      componentes: [
        { nome: 'Resistor', valor: '10kΩ', quantidade: 2 },
        { nome: 'CI', valor: '555', quantidade: 1 },
        { nome: 'Capacitor', valor: '1000μF', quantidade: 1 },
        { nome: 'LED', valor: '5mm', quantidade: 3 }
      ]
    },
    {
      componentes: [] // Cenário sem componentes detectados
    }
  ];
  
  const analise = analises[Math.floor(Math.random() * analises.length)];
  
  // Criar lista para o popup
  let listaParaPopup = [];
  let totalItens = 0;
  
  if (analise.componentes.length === 0) {
    listaParaPopup = ['0 itens detectados'];
  } else {
    analise.componentes.forEach(comp => {
      listaParaPopup.push(`${comp.quantidade} ${comp.nome}`);
      totalItens += comp.quantidade;
    });
  }
  
  // Formatar o que será salvo no banco
  const resultado_para_banco = analise.componentes.length === 0 ? 
    '0 itens detectados' :
    analise.componentes.map(comp => 
      `${comp.quantidade}x ${comp.nome} ${comp.valor}`
    ).join(', ');
  
  res.json({
    success: true,
    itens_detectados: listaParaPopup,
    total_itens: totalItens,
    resultado_scan: resultado_para_banco,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/gemini/analisar-componentes', async (req, res) => {
  const { imageBase64 } = req.body;
  
  console.log('🔍 Recebida requisição Gemini');
  console.log('Tamanho da imagem:', imageBase64 ? imageBase64.length : 'undefined');
  
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'Imagem é obrigatória' });
  }

  try {
    console.log('🚀 Enviando para Gemini API...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analise esta imagem e identifique os objetos que você consegue ver CLARAMENTE. PRIORIZE componentes eletrônicos (resistores, capacitores, LEDs, CIs, etc.), mas se não houver nenhum, identifique outros objetos visíveis.\n\nRetorne no formato:\nX nome_do_objeto\n\nExemplos:\n2 resistores\n1 fone bluetooth\n1 caneta\n3 dedos\n\nSe não conseguir identificar NADA, responda: 'Nenhum objeto identificado'\n\nSeja preciso e honesto sobre o que realmente vê."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      })
    });

    console.log('Status da resposta:', response.status);
    const data = await response.json();
    console.log('Resposta completa do Gemini:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const resultado = data.candidates[0].content.parts[0].text;
      console.log('✅ Resultado extraido:', resultado);
      res.json({ success: true, resultado });
    } else {
      console.log('❌ Estrutura de resposta inválida');
      throw new Error('Resposta inválida do Gemini');
    }
  } catch (error) {
    console.error('❌ Erro Gemini:', error);
    res.json({ 
      success: false, 
      resultado: 'Falha na análise do Gemini. Verifique a conexão e tente novamente.'
    });
  }
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

app.delete('/api/limpar-historico', (req, res) => {
  const db = createConnection();
  const query = 'DELETE FROM historico_agendamentos';
  
  db.query(query, (err, result) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao limpar histórico' });
    }
    
    res.json({ success: true, message: `${result.affectedRows} registros removidos do histórico` });
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



// Executar limpeza automática a cada hora
setInterval(() => {
  moverAgendamentosExpirados();
}, 60 * 60 * 1000); // 1 hora

// Executar limpeza inicial ao iniciar o servidor
moverAgendamentosExpirados();

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Usando MySQL como banco de dados`);
    console.log(`⏰ Limpeza automática de agendamentos ativada`);
    console.log(`🔄 Polling automático a cada 0.5s para tempo real`);
  });
}

// Debug - verificar scans do user1 hoje
app.get('/api/debug-scans-user1-hoje', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  
  // Verificar se tabela scans existe
  const checkTableQuery = 'SHOW TABLES LIKE "scans"';
  
  db.query(checkTableQuery, (err, tableResults) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao verificar tabela' });
    }
    
    if (tableResults.length === 0) {
      db.end();
      return res.json({
        success: true,
        tabela_existe: false,
        message: 'Tabela scans não existe - por isso não há scans'
      });
    }
    
    // Buscar scans do user1 para hoje
    const queryScans = 'SELECT * FROM scans WHERE usuario = "user1" AND DATE(data_hora) = ? ORDER BY data_hora';
    
    db.query(queryScans, [hoje], (err, scans) => {
      if (err) {
        db.end();
        return res.status(500).json({ success: false, message: 'Erro ao buscar scans' });
      }
      
      // Verificar agendamento ativo do user1 hoje
      const queryAgendamento = 'SELECT * FROM agendamentos WHERE nome = "user1" AND data = ?';
      
      db.query(queryAgendamento, [hoje], (err, agendamentos) => {
        db.end();
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
        }
        
        const horaAtual = new Date().getHours();
        let periodoAtual = '';
        if (horaAtual >= 7 && horaAtual < 13) {
          periodoAtual = 'manha';
        } else if (horaAtual >= 13 && horaAtual < 18) {
          periodoAtual = 'tarde';
        } else if (horaAtual >= 18 && horaAtual < 23) {
          periodoAtual = 'noite';
        }
        
        res.json({
          success: true,
          tabela_existe: true,
          data_hoje: hoje,
          hora_atual: horaAtual,
          periodo_atual: periodoAtual,
          agendamentos_user1: agendamentos.map(a => ({
            ...a,
            data: new Date(a.data).toISOString().split('T')[0]
          })),
          scans_user1: scans,
          total_scans: scans.length,
          tem_scan_inicio: scans.some(s => s.tipo_scan === 'inicio'),
          tem_scan_fim: scans.some(s => s.tipo_scan === 'fim')
        });
      });
    });
  });
});

// Limpar scans incorretos do user1 hoje
app.delete('/api/limpar-scans-user1-hoje', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  
  const query = 'DELETE FROM scans WHERE usuario = "user1" AND DATE(data_hora) = ?';
  
  db.query(query, [hoje], (err, result) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao limpar scans' });
    }
    
    res.json({
      success: true,
      message: `${result.affectedRows} scans removidos para user1 em ${hoje}`,
      removidos: result.affectedRows
    });
  });
});

// Apagar TODOS os scans fantasmas do user1
app.post('/api/apagar-scans-fantasmas-user1', (req, res) => {
  const db = createConnection();
  
  // Primeiro verificar quantos scans existem
  const countQuery = 'SELECT COUNT(*) as total FROM scans WHERE usuario = "user1"';
  
  db.query(countQuery, (err, countResult) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao contar scans' });
    }
    
    const totalScans = countResult[0].total;
    
    if (totalScans === 0) {
      db.end();
      return res.json({
        success: true,
        message: 'Nenhum scan encontrado para user1',
        removidos: 0
      });
    }
    
    // Apagar todos os scans do user1
    const deleteQuery = 'DELETE FROM scans WHERE usuario = "user1"';
    
    db.query(deleteQuery, (err, result) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao apagar scans' });
      }
      
      res.json({
        success: true,
        message: `TODOS os ${result.affectedRows} scans fantasmas do user1 foram apagados!`,
        removidos: result.affectedRows,
        total_antes: totalScans
      });
    });
  });
});

// Rota simples para testar se funcionou
app.get('/api/teste-scan-limpo', (req, res) => {
  const db = createConnection();
  
  const query = 'SELECT COUNT(*) as total FROM scans WHERE usuario = "user1"';
  
  db.query(query, (err, result) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao verificar' });
    }
    
    const total = result[0].total;
    
    res.json({
      success: true,
      scans_user1: total,
      status: total === 0 ? 'LIMPO ✅' : `AINDA TEM ${total} SCANS ❌`,
      message: total === 0 ? 'Scans fantasmas removidos com sucesso!' : 'Ainda existem scans do user1'
    });
  });
});

// DIAGNÓSTICO COMPLETO - Por que só o FIM está habilitado?
app.get('/api/diagnostico-scan-user1', (req, res) => {
  const db = createConnection();
  const agora = new Date();
  const hoje = agora.toISOString().split('T')[0];
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();
  
  // Determinar período atual
  let periodoAtual = '';
  let podeEscanear = false;
  
  if (horaAtual >= 7 && horaAtual < 13) {
    periodoAtual = 'manha';
    podeEscanear = true;
  } else if (horaAtual >= 13 && horaAtual < 18) {
    periodoAtual = 'tarde';
    podeEscanear = true;
  } else if (horaAtual >= 18 && horaAtual < 23) {
    periodoAtual = 'noite';
    podeEscanear = true;
  } else {
    periodoAtual = 'fora_horario';
    podeEscanear = false;
  }
  
  // Verificar agendamento ativo
  const queryAgendamento = 'SELECT * FROM agendamentos WHERE nome = "user1" AND data = ? AND horario = ?';
  
  db.query(queryAgendamento, [hoje, periodoAtual], (err, agendamentos) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao buscar agendamento' });
    }
    
    const temAgendamento = agendamentos.length > 0;
    
    // Verificar scans do user1 hoje
    const queryScans = 'SELECT * FROM scans WHERE usuario = "user1" AND DATE(data_hora) = ? ORDER BY data_hora';
    
    db.query(queryScans, [hoje], (err, scans) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar scans' });
      }
      
      const temScanInicio = scans.some(s => s.tipo_scan === 'inicio');
      const temScanFim = scans.some(s => s.tipo_scan === 'fim');
      
      // Lógica do que deveria estar habilitado
      let deveHabilitarInicio = false;
      let deveHabilitarFim = false;
      
      if (temAgendamento && podeEscanear) {
        if (!temScanInicio) {
          deveHabilitarInicio = true;
          deveHabilitarFim = false;
        } else if (temScanInicio && !temScanFim) {
          deveHabilitarInicio = false;
          deveHabilitarFim = true;
        } else {
          deveHabilitarInicio = false;
          deveHabilitarFim = false;
        }
      }
      
      res.json({
        success: true,
        diagnostico: {
          data_hora: `${hoje} ${horaAtual}:${minutoAtual.toString().padStart(2, '0')}`,
          periodo_atual: periodoAtual,
          pode_escanear_horario: podeEscanear,
          tem_agendamento: temAgendamento,
          agendamento: temAgendamento ? agendamentos[0] : null,
          scans_hoje: {
            total: scans.length,
            tem_inicio: temScanInicio,
            tem_fim: temScanFim,
            lista: scans
          },
          botoes_devem_estar: {
            inicio_habilitado: deveHabilitarInicio,
            fim_habilitado: deveHabilitarFim
          },
          problema_identificado: {
            sem_agendamento: !temAgendamento,
            fora_horario: !podeEscanear,
            scan_inicio_fantasma: temScanInicio && scans.length > 0,
            ja_completou_ciclo: temScanInicio && temScanFim
          }
        }
      });
    });
  });
});

// Verificar especificamente a lógica INÍCIO/FIM
app.get('/api/verificar-logica-scan-user1', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  
  // Buscar scans do user1 hoje
  const queryScans = 'SELECT * FROM scans WHERE usuario = "user1" AND DATE(data_hora) = ? ORDER BY data_hora';
  
  db.query(queryScans, [hoje], (err, scans) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar scans' });
    }
    
    const scanInicio = scans.find(s => s.tipo_scan === 'inicio');
    const scanFim = scans.find(s => s.tipo_scan === 'fim');
    
    // Lógica correta:
    // - Se NÃO tem scan início: só INÍCIO deve estar habilitado
    // - Se tem scan início mas NÃO tem fim: só FIM deve estar habilitado
    // - Se tem ambos: nenhum deve estar habilitado
    
    let statusCorreto = '';
    let problemaIdentificado = '';
    
    if (!scanInicio && !scanFim) {
      statusCorreto = 'Só INÍCIO deve estar habilitado';
      problemaIdentificado = 'Se só FIM está habilitado, há scan INÍCIO fantasma!';
    } else if (scanInicio && !scanFim) {
      statusCorreto = 'Só FIM deve estar habilitado';
      problemaIdentificado = 'Situação normal - você fez início, agora pode fazer fim';
    } else if (scanInicio && scanFim) {
      statusCorreto = 'Nenhum botão deve estar habilitado';
      problemaIdentificado = 'Ciclo completo - você já fez início e fim';
    }
    
    res.json({
      success: true,
      situacao_atual: {
        data: hoje,
        total_scans: scans.length,
        tem_scan_inicio: !!scanInicio,
        tem_scan_fim: !!scanFim,
        scan_inicio: scanInicio || null,
        scan_fim: scanFim || null
      },
      logica_correta: {
        status: statusCorreto,
        problema: problemaIdentificado
      },
      todos_scans: scans,
      acao_recomendada: !scanInicio && !scanFim ? 
        'Se só FIM está habilitado, execute: POST /api/reset-completo-user1' : 
        'Situação parece normal'
    });
  });
});

// Forçar reset completo do user1 (agendamento + scans)
app.post('/api/reset-completo-user1', (req, res) => {
  const db = createConnection();
  
  // Primeiro apagar todos os scans
  const deleteScanQuery = 'DELETE FROM scans WHERE usuario = "user1"';
  
  db.query(deleteScanQuery, (err, scanResult) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao apagar scans' });
    }
    
    res.json({
      success: true,
      message: 'Reset completo do user1 realizado!',
      scans_removidos: scanResult.affectedRows,
      status: 'Agora APENAS o scan de INÍCIO deve estar habilitado'
    });
    
    db.end();
  });
});

// CORREÇÃO IMEDIATA - Apagar scan início fantasma
app.post('/api/corrigir-scan-fantasma-user1', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  
  // Apagar especificamente scans de início de hoje
  const deleteQuery = 'DELETE FROM scans WHERE usuario = "user1" AND DATE(data_hora) = ? AND tipo_scan = "inicio"';
  
  db.query(deleteQuery, [hoje], (err, result) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao corrigir' });
    }
    
    res.json({
      success: true,
      message: `${result.affectedRows} scans de INÍCIO fantasmas removidos!`,
      removidos: result.affectedRows,
      status: 'Agora só o botão INÍCIO deve estar habilitado'
    });
  });
});

// Teste da análise de componentes
app.get('/api/teste-analise', (req, res) => {
  const exemplo_componentes = [
    { nome: 'Resistor', quantidade: 2 },
    { nome: 'LED', quantidade: 1 }
  ];
  
  const listaParaPopup = exemplo_componentes.map(comp => 
    `${comp.quantidade} ${comp.nome}`
  );
  
  res.json({
    success: true,
    message: 'Teste da análise de componentes',
    itens_detectados: listaParaPopup,
    total_itens: 3
  });
});

// Verificar se agendamento de hoje será movido para histórico
app.get('/api/verificar-historico-hoje', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  const horaAtual = new Date().getHours();
  
  // Verificar agendamentos de hoje
  const queryAgendamentos = 'SELECT * FROM agendamentos WHERE data = ?';
  
  db.query(queryAgendamentos, [hoje], (err, agendamentos) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
    
    // Verificar histórico de hoje
    const queryHistorico = 'SELECT * FROM historico_agendamentos WHERE data = ?';
    
    db.query(queryHistorico, [hoje], (err, historico) => {
      if (err) {
        db.end();
        return res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
      }
      
      // Verificar scans de hoje
      const queryScans = 'SELECT * FROM scans WHERE DATE(data_hora) = ?';
      
      db.query(queryScans, [hoje], (err, scans) => {
        db.end();
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro ao buscar scans' });
        }
        
        // Determinar quando será movido
        let quando_sera_movido = '';
        const agendamentoTarde = agendamentos.find(a => a.horario === 'tarde');
        
        if (agendamentoTarde) {
          if (horaAtual >= 18) {
            quando_sera_movido = 'JÁ DEVERIA estar no histórico (após 18h)';
          } else {
            quando_sera_movido = `Será movido às 18:00 (faltam ${18 - horaAtual}h)`;
          }
        }
        
        res.json({
          success: true,
          data_hoje: hoje,
          hora_atual: horaAtual,
          agendamentos_hoje: agendamentos.map(a => ({
            ...a,
            data: new Date(a.data).toISOString().split('T')[0]
          })),
          historico_hoje: historico.map(h => ({
            ...h,
            data: new Date(h.data).toISOString().split('T')[0]
          })),
          scans_hoje: scans,
          previsao: {
            quando_sera_movido,
            aparecera_no_historico: quando_sera_movido.includes('JÁ DEVERIA') ? 'SIM' : 'AINDA NÃO'
          }
        });
      });
    });
  });
});

// Verificar reservas da semana passada
app.get('/api/reservas/semana-passada', (req, res) => {
  const db = createConnection();
  const hoje = new Date();
  const inicioSemanaPassada = new Date(hoje);
  inicioSemanaPassada.setDate(hoje.getDate() - hoje.getDay() - 7); // Domingo da semana passada
  const fimSemanaPassada = new Date(inicioSemanaPassada);
  fimSemanaPassada.setDate(inicioSemanaPassada.getDate() + 6); // Sábado da semana passada
  
  const dataInicio = inicioSemanaPassada.toISOString().split('T')[0];
  const dataFim = fimSemanaPassada.toISOString().split('T')[0];
  
  // Buscar em agendamentos ativos
  const queryAgendamentos = 'SELECT nome, data, horario, "ativo" as origem FROM agendamentos WHERE data BETWEEN ? AND ?';
  
  db.query(queryAgendamentos, [dataInicio, dataFim], (err, agendamentos) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
    
    // Buscar no histórico
    const queryHistorico = 'SELECT nome, data, horario, "historico" as origem FROM historico_agendamentos WHERE data BETWEEN ? AND ?';
    
    db.query(queryHistorico, [dataInicio, dataFim], (err, historico) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
      }
      
      // Combinar resultados
      const todasReservas = [...agendamentos, ...historico].map(reserva => ({
        ...reserva,
        data: new Date(reserva.data).toISOString().split('T')[0]
      })).sort((a, b) => new Date(a.data) - new Date(b.data));
      
      res.json({
        success: true,
        periodo: {
          inicio: dataInicio,
          fim: dataFim,
          descricao: 'Semana passada'
        },
        reservas: todasReservas,
        total: todasReservas.length,
        resumo: {
          por_dia: todasReservas.reduce((acc, r) => {
            acc[r.data] = (acc[r.data] || 0) + 1;
            return acc;
          }, {}),
          por_horario: todasReservas.reduce((acc, r) => {
            acc[r.horario] = (acc[r.horario] || 0) + 1;
            return acc;
          }, {})
        }
      });
    });
  });
});

// Verificar reservas de uma semana específica (10/11 a 16/11)
app.get('/api/verificar-semana-10-11', (req, res) => {
  const db = createConnection();
  const dataInicio = '2024-11-10';
  const dataFim = '2024-11-16';
  
  // Buscar em agendamentos ativos
  const queryAgendamentos = 'SELECT nome, data, horario, "ativo" as origem FROM agendamentos WHERE data BETWEEN ? AND ?';
  
  db.query(queryAgendamentos, [dataInicio, dataFim], (err, agendamentos) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
    
    // Buscar no histórico
    const queryHistorico = 'SELECT nome, data, horario, "historico" as origem FROM historico_agendamentos WHERE data BETWEEN ? AND ?';
    
    db.query(queryHistorico, [dataInicio, dataFim], (err, historico) => {
      db.end();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
      }
      
      // Combinar e organizar resultados
      const todasReservas = [...agendamentos, ...historico].map(reserva => ({
        ...reserva,
        data: new Date(reserva.data).toISOString().split('T')[0]
      })).sort((a, b) => new Date(a.data) - new Date(b.data));
      
      // Verificar especificamente 14/11 à noite
      const reserva14NoiteAtivos = agendamentos.filter(r => 
        new Date(r.data).toISOString().split('T')[0] === '2024-11-14' && r.horario === 'noite'
      );
      
      const reserva14NoiteHistorico = historico.filter(r => 
        new Date(r.data).toISOString().split('T')[0] === '2024-11-14' && r.horario === 'noite'
      );
      
      res.json({
        success: true,
        periodo: {
          inicio: dataInicio,
          fim: dataFim,
          descricao: 'Semana de 10/11 a 16/11/2024'
        },
        todas_reservas: todasReservas,
        total_reservas: todasReservas.length,
        investigacao_14_11_noite: {
          encontrada_em_ativos: reserva14NoiteAtivos.length > 0,
          encontrada_em_historico: reserva14NoiteHistorico.length > 0,
          detalhes_ativos: reserva14NoiteAtivos,
          detalhes_historico: reserva14NoiteHistorico,
          status: reserva14NoiteAtivos.length > 0 ? 'ENCONTRADA EM ATIVOS' : 
                  reserva14NoiteHistorico.length > 0 ? 'ENCONTRADA EM HISTÓRICO' : 
                  'NÃO ENCONTRADA'
        },
        resumo_por_dia: {
          '2024-11-10': todasReservas.filter(r => r.data === '2024-11-10'),
          '2024-11-11': todasReservas.filter(r => r.data === '2024-11-11'),
          '2024-11-12': todasReservas.filter(r => r.data === '2024-11-12'),
          '2024-11-13': todasReservas.filter(r => r.data === '2024-11-13'),
          '2024-11-14': todasReservas.filter(r => r.data === '2024-11-14'),
          '2024-11-15': todasReservas.filter(r => r.data === '2024-11-15'),
          '2024-11-16': todasReservas.filter(r => r.data === '2024-11-16')
        }
      });
    });
  });
});

// Endpoint para verificar status dos horários em tempo real
app.get('/api/status-horarios/:data', (req, res) => {
  const { data } = req.params;
  const db = createConnection();
  
  const query = 'SELECT horario, nome FROM agendamentos WHERE data = ?';
  
  db.query(query, [data], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    // Criar objeto com status de cada horário
    const status = {
      manha: { ocupado: false, nome: null },
      tarde: { ocupado: false, nome: null },
      noite: { ocupado: false, nome: null }
    };
    
    results.forEach(agendamento => {
      status[agendamento.horario] = {
        ocupado: true,
        nome: agendamento.nome
      };
    });
    
    res.json({ 
      success: true, 
      data,
      status,
      timestamp: new Date().toISOString()
    });
  });
});

// Corrigir datas incorretas no histórico
app.get('/api/corrigir-historico-data', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  
  // Buscar reservas do histórico com data 2024-11-16
  const queryVerificar = 'SELECT * FROM historico_agendamentos WHERE DATE(data) = "2024-11-16"';
  
  db.query(queryVerificar, (err, reservasIncorretas) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao verificar histórico' });
    }
    
    if (reservasIncorretas.length === 0) {
      db.end();
      return res.json({ 
        success: true, 
        message: 'Nenhuma reserva com data incorreta encontrada',
        reservas_encontradas: 0
      });
    }
    
    // Corrigir as datas para hoje
    const queryCorrigir = 'UPDATE historico_agendamentos SET data = ? WHERE DATE(data) = "2024-11-16"';
    
    db.query(queryCorrigir, [hoje], (err, result) => {
      db.end();
      
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao corrigir datas' });
      }
      
      res.json({
        success: true,
        message: `${result.affectedRows} reservas corrigidas para a data de hoje`,
        data_corrigida: hoje,
        reservas_corrigidas: result.affectedRows,
        detalhes: reservasIncorretas.map(r => ({
          id: r.id,
          nome: r.nome,
          horario: r.horario,
          data_anterior: r.data,
          data_nova: hoje
        }))
      });
    });
  });
});

// Mover reserva da tarde de volta para agendamentos ativos
app.post('/api/mover-tarde-volta', (req, res) => {
  const db = createConnection();
  const hoje = new Date().toISOString().split('T')[0];
  const horaAtual = new Date().getHours();
  const minutoAtual = new Date().getMinutes();
  
  // Verificar se ainda está no horário da tarde (antes das 17:45)
  const dentroHorarioTarde = horaAtual < 17 || (horaAtual === 17 && minutoAtual < 45);
  
  if (!dentroHorarioTarde) {
    db.end();
    return res.json({ success: false, message: 'Já passou do horário da tarde (17:45)' });
  }
  
  // Buscar reserva da tarde no histórico
  const queryBuscar = 'SELECT * FROM historico_agendamentos WHERE data = ? AND horario = "tarde"';
  
  db.query(queryBuscar, [hoje], (err, reservas) => {
    if (err) {
      db.end();
      return res.status(500).json({ success: false, message: 'Erro ao buscar reserva' });
    }
    
    if (reservas.length === 0) {
      db.end();
      return res.json({ success: false, message: 'Nenhuma reserva da tarde encontrada no histórico' });
    }
    
    const reserva = reservas[0];
    
    // Inserir de volta em agendamentos
    const queryInserir = 'INSERT INTO agendamentos (nome, data, horario) VALUES (?, ?, ?)';
    
    db.query(queryInserir, [reserva.nome, reserva.data, reserva.horario], (err) => {
      if (err) {
        db.end();
        return res.status(500).json({ success: false, message: 'Erro ao inserir reserva' });
      }
      
      // Remover do histórico
      const queryRemover = 'DELETE FROM historico_agendamentos WHERE id = ?';
      
      db.query(queryRemover, [reserva.id], (err) => {
        db.end();
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro ao remover do histórico' });
        }
        
        res.json({
          success: true,
          message: 'Reserva da tarde movida de volta para Ver Reservas',
          reserva: {
            nome: reserva.nome,
            data: hoje,
            horario: 'tarde'
          }
        });
      });
    });
  });
});

// Para Vercel
module.exports = app;