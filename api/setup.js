const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828,
  acquireTimeout: 60000,
  timeout: 60000
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const db = mysql.createConnection(dbConfig);
  
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
    )`
  ];
  
  let completed = 0;
  let errors = [];
  
  queries.forEach((query, index) => {
    db.query(query, (err) => {
      if (err) {
        errors.push(`Query ${index}: ${err.message}`);
      }
      completed++;
      
      if (completed === queries.length) {
        // Inserir dados iniciais
        const insertQueries = [
          `INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
            ('admin', '123', 'admin@teste.com'),
            ('user1', '123', 'user1@teste.com'),
            ('petrus', '123', 'petrus@teste.com')`,
          `INSERT IGNORE INTO supervisor (usuario, senha, email) VALUES 
            ('supervisor', 'admin123', 'supervisor@teste.com')`
        ];
        
        let insertCompleted = 0;
        
        insertQueries.forEach((insertQuery) => {
          db.query(insertQuery, (err) => {
            if (err) {
              errors.push(`Insert: ${err.message}`);
            }
            insertCompleted++;
            
            if (insertCompleted === insertQueries.length) {
              db.end();
              res.json({ 
                success: true, 
                message: 'Banco Railway configurado!',
                errors: errors.length > 0 ? errors : null
              });
            }
          });
        });
      }
    });
  });
};