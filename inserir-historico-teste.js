const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Inserindo reservas de teste no histórico...');

const db = mysql.createConnection(dbConfig);

const hoje = new Date();
const ontem = new Date(hoje);
ontem.setDate(hoje.getDate() - 1);

const anteontem = new Date(hoje);
anteontem.setDate(hoje.getDate() - 2);

const tresdiasatras = new Date(hoje);
tresdiasatras.setDate(hoje.getDate() - 3);

const reservasHistorico = [
  ['João Silva', ontem.toISOString().split('T')[0], '08:00'],
  ['Maria Santos', anteontem.toISOString().split('T')[0], '14:00'],
  ['Pedro Costa', tresdiasatras.toISOString().split('T')[0], '10:00']
];

const query = 'INSERT INTO historico_agendamentos (nome, data, horario) VALUES ?';

db.query(query, [reservasHistorico], (err, result) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log('✅ 3 reservas inseridas no histórico com sucesso!');
    console.log('Reservas inseridas:');
    reservasHistorico.forEach((reserva, i) => {
      console.log(`${i+1}. ${reserva[0]} - ${reserva[1]} às ${reserva[2]}`);
    });
  }
});