const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Corrigindo horário da reserva do user1...');

const db = mysql.createConnection(dbConfig);

const query = 'UPDATE agendamentos SET horario = "tarde" WHERE nome = "user1" AND data = "2025-10-31"';

db.query(query, (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log(`✅ ${result.affectedRows} reserva(s) atualizada(s)`);
    console.log('Horário alterado para "tarde"');
  }
});