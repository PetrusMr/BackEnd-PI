const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar:', err);
    return;
  }
  
  console.log('✅ Conectado ao Railway');
  
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