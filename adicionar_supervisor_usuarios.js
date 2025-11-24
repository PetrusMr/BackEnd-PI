const mysql = require('mysql2/promise');

async function adicionarSupervisorUsuarios() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    // Adicionar supervisores na tabela usuarios
    await connection.execute(`
      INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
      ('admin', 'admin123', 'admin@supervisor.com'),
      ('supervisor', 'super123', 'supervisor@teste.com')
    `);
    console.log('✅ Supervisores adicionados na tabela usuarios');

    // Verificar tabela usuarios
    const [users] = await connection.execute('SELECT * FROM usuarios');
    console.log('\n👥 USUÁRIOS:');
    users.forEach(user => {
      console.log(`  - Usuario: "${user.usuario}" | Senha: "${user.senha}"`);
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

adicionarSupervisorUsuarios();