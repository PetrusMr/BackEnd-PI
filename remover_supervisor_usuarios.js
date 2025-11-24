const mysql = require('mysql2/promise');

async function removerSupervisorUsuarios() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    // Remover supervisor da tabela usuarios
    await connection.execute("DELETE FROM usuarios WHERE usuario = 'supervisor'");
    console.log('✅ Supervisor removido da tabela usuarios');

    // Verificar tabela usuarios
    const [users] = await connection.execute('SELECT * FROM usuarios');
    console.log('\n👥 USUÁRIOS RESTANTES:');
    users.forEach(user => {
      console.log(`  - Usuario: "${user.usuario}" | Senha: "${user.senha}"`);
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

removerSupervisorUsuarios();