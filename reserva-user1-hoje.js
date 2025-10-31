const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Criando reserva para user1 hoje à tarde...');

const db = mysql.createConnection(dbConfig);

const reserva = ['user1', '2025-10-31', '14:00'];

const query = 'INSERT INTO agendamentos (nome, data, horario) VALUES (?, ?, ?)';

db.query(query, reserva, (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log('✅ Reserva criada!');
    console.log(`Nome: ${reserva[0]}`);
    console.log(`Data: ${reserva[1]}`);
    console.log(`Horário: ${reserva[2]} (tarde)`);
  }
});