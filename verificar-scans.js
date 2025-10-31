const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Verificando tabela de scans...');

const db = mysql.createConnection(dbConfig);

// Verificar se tabela existe
db.query('SHOW TABLES LIKE "scans"', (err, results) => {
  if (err) {
    console.error('❌ Erro ao verificar tabelas:', err.message);
    db.end();
    return;
  }
  
  if (results.length === 0) {
    console.log('❌ Tabela "scans" não existe');
    console.log('Criando tabela scans...');
    
    const createTable = `CREATE TABLE scans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario VARCHAR(50) NOT NULL,
      tipo_scan VARCHAR(20) NOT NULL,
      resultado_scan TEXT NOT NULL,
      turno VARCHAR(20),
      data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    db.query(createTable, (err) => {
      if (err) {
        console.error('❌ Erro ao criar tabela:', err.message);
      } else {
        console.log('✅ Tabela scans criada com sucesso');
      }
      
      // Verificar dados
      verificarDados();
    });
  } else {
    console.log('✅ Tabela "scans" existe');
    verificarDados();
  }
});

function verificarDados() {
  db.query('SELECT * FROM scans ORDER BY data_hora DESC LIMIT 10', (err, results) => {
    db.end();
    if (err) {
      console.error('❌ Erro ao buscar scans:', err.message);
      return;
    }
    
    console.log(`📊 Total de scans encontrados: ${results.length}`);
    
    if (results.length > 0) {
      console.log('\n📋 Últimos scans:');
      results.forEach((scan, i) => {
        console.log(`${i+1}. ${scan.usuario} - ${scan.tipo_scan} - ${scan.resultado_scan} - ${scan.data_hora}`);
      });
    } else {
      console.log('❌ Nenhum scan encontrado no banco');
    }
  });
}