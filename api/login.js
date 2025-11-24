const mysql = require('mysql2');

const dbConfig = {
  host: 'switchyard.proxy.rlwy.net',
  user: 'root',
  password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
  database: 'railway',
  port: 41445
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { usuario, senha, isSupervisor } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
  }
  
  const db = mysql.createConnection(dbConfig);
  const tabela = isSupervisor ? 'supervisor' : 'usuarios';
  const query = `SELECT * FROM ${tabela} WHERE usuario = ? AND senha = ?`;
  
  db.query(query, [usuario, senha], (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    if (results.length > 0) {
      const message = isSupervisor ? 'Login de supervisor realizado com sucesso' : 'Login realizado com sucesso';
      res.json({ success: true, message });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  });
};