const mysql = require('mysql2/promise');

async function verificarUsuarios() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    console.log('✅ Conectado ao Railway!');

    // Verificar usuários
    const [users] = await connection.execute('SELECT * FROM usuarios');
    console.log('\n👥 USUÁRIOS:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id} | Usuario: "${user.usuario}" | Senha: "${user.senha}"`);
    });

    // Verificar supervisores
    const [supervisors] = await connection.execute('SELECT * FROM supervisor');
    console.log('\n👨💼 SUPERVISORES:');
    supervisors.forEach(sup => {
      console.log(`  - ID: ${sup.id} | Usuario: "${sup.usuario}" | Senha: "${sup.senha}"`);
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarUsuarios();