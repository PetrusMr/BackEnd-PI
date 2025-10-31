const mysql = require('mysql2');

const dbConfig = {
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'EnXDVvvfjWbNUhrgInfThiDFgtnKTTAD',
  database: 'railway',
  port: 22828
};

console.log('Conectando ao Railway MySQL...');

const db = mysql.createConnection(dbConfig);

const queries = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    horario VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS supervisor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS historico_agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    horario VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

async function setupDatabase() {
  try {
    console.log('Criando tabelas...');
    
    for (let i = 0; i < queries.length; i++) {
      await new Promise((resolve, reject) => {
        db.query(queries[i], (err) => {
          if (err) {
            console.error(`Erro na query ${i}:`, err.message);
            reject(err);
          } else {
            console.log(`Tabela ${i + 1} criada com sucesso`);
            resolve();
          }
        });
      });
    }
    
    console.log('Inserindo dados iniciais...');
    
    await new Promise((resolve, reject) => {
      const insertUsers = `INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
        ('admin', '123', 'admin@teste.com'),
        ('user1', '123', 'user1@teste.com'),
        ('petrus', '123', 'petrus@teste.com')`;
      
      db.query(insertUsers, (err) => {
        if (err) {
          console.error('Erro ao inserir usuários:', err.message);
          reject(err);
        } else {
          console.log('Usuários inseridos');
          resolve();
        }
      });
    });
    
    await new Promise((resolve, reject) => {
      const insertSupervisor = `INSERT IGNORE INTO supervisor (usuario, senha, email) VALUES 
        ('supervisor', 'admin123', 'supervisor@teste.com')`;
      
      db.query(insertSupervisor, (err) => {
        if (err) {
          console.error('Erro ao inserir supervisor:', err.message);
          reject(err);
        } else {
          console.log('Supervisor inserido');
          resolve();
        }
      });
    });
    
    console.log('✅ Banco Railway configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    db.end();
  }
}

setupDatabase();