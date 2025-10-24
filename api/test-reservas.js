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
  
  db.query('SELECT * FROM agendamentos', (err, results) => {
    db.end();
    if (err) {
      return res.json({ success: false, error: err.message });
    }
    
    res.json({ 
      success: true, 
      total: results.length,
      reservas: results.map(r => ({
        id: r.id,
        nome: r.nome,
        data: r.data,
        horario: r.horario
      }))
    });
  });
};