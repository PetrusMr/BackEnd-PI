const mysql = require('mysql2/promise');

async function criarTabelas() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    console.log('✅ Conectado ao Railway!');

    // 1. Criar tabela usuarios
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        senha VARCHAR(50) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela usuarios criada');

    // 2. Criar tabela supervisor
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supervisor (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        nome VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela supervisor criada');

    // 3. Criar tabela agendamentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        data VARCHAR(10) NOT NULL,
        horario VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela agendamentos criada');

    // 4. Criar tabela historico_agendamentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS historico_agendamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        data DATE NOT NULL,
        horario ENUM('manha', 'tarde', 'noite') NOT NULL,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela historico_agendamentos criada');

    // 5. Criar tabela scans
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS scans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL,
        data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        turno ENUM('manha', 'tarde', 'noite'),
        tipo_scan ENUM('inicio', 'fim') NOT NULL,
        resultado_scan TEXT NOT NULL
      )
    `);
    console.log('✅ Tabela scans criada');

    // 6. Inserir usuários
    await connection.execute(`
      INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
      ('admin', '123', 'admin@teste.com'),
      ('user1', '123', 'user1@teste.com'),
      ('petrus', '123', 'petrus@teste.com')
    `);
    console.log('✅ Usuários inseridos');

    // 7. Inserir supervisores
    await connection.execute(`
      INSERT IGNORE INTO supervisor (usuario, senha, nome) VALUES 
      ('admin', 'admin123', 'Administrador'),
      ('supervisor', 'super123', 'Supervisor')
    `);
    console.log('✅ Supervisores inseridos');

    // Verificar tabelas criadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tabelas no banco:');
    tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));

    console.log('\n🎉 Todas as tabelas criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

criarTabelas();