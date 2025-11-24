const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'sql10.freesqldatabase.com',
  user: 'sql10804387',
  password: 'PfvDQC2YPa',
  database: 'sql10804387'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar:', err);
    return;
  }
  
  console.log('✅ Conectado ao MySQL');
  
  const query = 'DELETE FROM historico_agendamentos';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('❌ Erro ao limpar histórico:', err);
    } else {
      console.log(`✅ Histórico limpo! ${result.affectedRows} registros removidos`);
    }
    
    db.end();
  });
});