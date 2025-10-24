const mysql = require('mysql2');

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'sql10804387',
  password: 'PfvDQC2YPa',
  database: 'sql10804387',
  port: 3306
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const db = mysql.createConnection(dbConfig);
  
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataAmanha = amanha.toISOString().split('T')[0];
  
  const query = `INSERT INTO agendamentos (nome, data, horario) VALUES 
    ('Teste1', '${dataAmanha}', '08:00'),
    ('Teste2', '${dataAmanha}', '10:00')`;
  
  db.query(query, (err, result) => {
    db.end();
    if (err) {
      return res.json({ success: false, error: err.message });
    }
    
    res.json({ 
      success: true, 
      message: 'Reservas de teste criadas',
      data: dataAmanha
    });
  });
};