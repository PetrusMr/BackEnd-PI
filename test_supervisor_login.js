const mysql = require('mysql2/promise');

async function testarSupervisor() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    console.log('✅ Conectado ao Railway!');

    // Verificar supervisores
    const [supervisors] = await connection.execute('SELECT * FROM supervisor');
    console.log('\n👨💼 SUPERVISORES NO BANCO:');
    supervisors.forEach(sup => {
      console.log(`  - Usuario: "${sup.usuario}" | Senha: "${sup.senha}"`);
    });

    // Testar login específico
    const [result] = await connection.execute(
      'SELECT * FROM supervisor WHERE usuario = ? AND senha = ?',
      ['admin', 'admin123']
    );

    console.log('\n🔍 TESTE LOGIN admin/admin123:');
    if (result.length > 0) {
      console.log('✅ LOGIN FUNCIONOU!');
    } else {
      console.log('❌ LOGIN FALHOU!');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarSupervisor();