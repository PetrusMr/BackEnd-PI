const mysql = require('mysql2');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const db = mysql.createConnection({
    host: 'sql10.freesqldatabase.com',
    user: 'sql10804387',
    password: 'PfvDQC2YPa',
    database: 'sql10804387',
    port: 3306
  });
  
  db.query('SELECT * FROM agendamentos ORDER BY created_at DESC LIMIT 10', (err, results) => {
    db.end();
    if (err) {
      return res.json({ success: false, error: err.message });
    }
    
    res.json({ 
      success: true, 
      total: results.length,
      reservas: results
    });
  });
};