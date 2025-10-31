const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Criando duas reservas para user1 hoje...');

const db = mysql.createConnection(dbConfig);

// Primeiro limpar reservas existentes do user1
const deleteQuery = 'DELETE FROM agendamentos WHERE nome = "user1"';

db.query(deleteQuery, (err) => {
  if (err) {
    console.error('Erro ao limpar:', err.message);
  }
  
  // Inserir duas novas reservas
  const reservas = [
    ['user1', '2025-10-31', 'tarde'],
    ['user1', '2025-10-31', 'noite']
  ];
  
  const insertQuery = 'INSERT INTO agendamentos (nome, data, horario) VALUES ?';
  
  db.query(insertQuery, [reservas], (err, result) => {
    db.end();
    if (err) {
      console.error('❌ Erro:', err.message);
    } else {
      console.log('✅ 2 reservas criadas para user1:');
      console.log('1. user1 - 31/10/2025 - tarde');
      console.log('2. user1 - 31/10/2025 - noite');
    }
  });
});