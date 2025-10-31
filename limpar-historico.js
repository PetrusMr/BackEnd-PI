const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Apagando todas as reservas do histórico...');

const db = mysql.createConnection(dbConfig);

const query = 'DELETE FROM historico_agendamentos';

db.query(query, (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log(`✅ ${result.affectedRows} reserva(s) apagada(s) do histórico`);
    console.log('Histórico limpo');
  }
});