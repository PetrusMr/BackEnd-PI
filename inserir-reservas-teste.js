const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Inserindo reservas futuras de teste...');

const db = mysql.createConnection(dbConfig);

const hoje = new Date();
const amanha = new Date(hoje);
amanha.setDate(hoje.getDate() + 1);

const depoisdeamanha = new Date(hoje);
depoisdeamanha.setDate(hoje.getDate() + 2);

const reservasFuturas = [
  ['Ana Costa', amanha.toISOString().split('T')[0], '09:00'],
  ['Carlos Lima', amanha.toISOString().split('T')[0], '15:00'],
  ['Lucia Ferreira', depoisdeamanha.toISOString().split('T')[0], '11:00']
];

const query = 'INSERT INTO agendamentos (nome, data, horario) VALUES ?';

db.query(query, [reservasFuturas], (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log('✅ 3 reservas futuras inseridas com sucesso!');
    console.log('Reservas inseridas:');
    reservasFuturas.forEach((reserva, i) => {
      console.log(`${i+1}. ${reserva[0]} - ${reserva[1]} às ${reserva[2]}`);
    });
  }
});