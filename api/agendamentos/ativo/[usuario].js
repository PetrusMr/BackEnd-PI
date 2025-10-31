const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { usuario } = req.query;
  
  if (!usuario) {
    return res.status(400).json({ success: false, message: 'Usuário é obrigatório' });
  }

  const db = mysql.createConnection(dbConfig);
  const hoje = new Date().toISOString().split('T')[0];
  const query = 'SELECT * FROM agendamentos WHERE nome = ? AND data = ?';
  
  db.query(query, [usuario, hoje], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length > 0) {
      res.json({ 
        temAgendamento: true, 
        agendamento: {
          id: results[0].id,
          nome: results[0].nome,
          data: results[0].data,
          horario: results[0].horario
        }
      });
    } else {
      res.json({ 
        temAgendamento: false, 
        agendamento: null 
      });
    }
  });
};