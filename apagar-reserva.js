const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Apagando reserva de teste...');

const db = mysql.createConnection(dbConfig);

const query = 'DELETE FROM agendamentos WHERE nome = "Teste Scan" AND horario = "14:00"';

db.query(query, (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log(`✅ ${result.affectedRows} reserva(s) apagada(s)`);
  }
});