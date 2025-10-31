const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Criando reserva para hoje à tarde...');

const db = mysql.createConnection(dbConfig);

const hoje = new Date().toISOString().split('T')[0];
const reserva = ['Teste Scan', hoje, '14:00'];

const query = 'INSERT INTO agendamentos (nome, data, horario) VALUES (?, ?, ?)';

db.query(query, reserva, (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log('✅ Reserva criada para teste de scan!');
    console.log(`Nome: ${reserva[0]}`);
    console.log(`Data: ${reserva[1]} (hoje)`);
    console.log(`Horário: ${reserva[2]}`);
    console.log(`ID: ${result.insertId}`);
  }
});