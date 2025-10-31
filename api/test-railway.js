const mysql = require('mysql2');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const db = mysql.createConnection({
    host: 'shuttle.proxy.rlwy.net',
    user: 'root',
    password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
    database: 'railway',
    port: 22828
  });
  
  db.query('SELECT 1 as test', (err, results) => {
    db.end();
    if (err) {
      return res.json({ 
        success: false, 
        error: err.message,
        code: err.code
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Conexão Railway OK!',
      result: results[0]
    });
  });
};