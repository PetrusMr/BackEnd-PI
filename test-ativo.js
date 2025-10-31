const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Testando agendamento ativo para user1...');

const db = mysql.createConnection(dbConfig);
const hoje = new Date().toISOString().split('T')[0];
const query = 'SELECT * FROM agendamentos WHERE nome = ? AND data = ?';

db.query(query, ['user1', hoje], (err, results) => {
  db.end();
  if (err) {
    console.error('❌ Erro:', err.message);
  } else {
    console.log(`📅 Data de hoje: ${hoje}`);
    console.log(`📊 Reservas encontradas: ${results.length}`);
    
    if (results.length > 0) {
      console.log('✅ Agendamentos ativos:');
      results.forEach((r, i) => {
        console.log(`${i+1}. ${r.nome} - ${r.data} - ${r.horario}`);
      });
      
      console.log('\n🔄 Resposta da API:');
      console.log(JSON.stringify({
        temAgendamento: true,
        agendamento: {
          id: results[0].id,
          nome: results[0].nome,
          data: results[0].data,
          horario: results[0].horario
        }
      }, null, 2));
    } else {
      console.log('❌ Nenhum agendamento ativo encontrado');
    }
  }
});