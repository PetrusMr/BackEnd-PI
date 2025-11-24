const mysql = require('mysql2/promise');

async function testarNovoRailway() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    console.log('✅ Conectado ao novo Railway!');

    // Verificar tabelas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tabelas disponíveis:');
    tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));

    // Verificar usuários
    const [users] = await connection.execute('SELECT * FROM usuarios');
    console.log(`\n👥 Usuários: ${users.length} registros`);

    // Verificar supervisores
    const [supervisors] = await connection.execute('SELECT * FROM supervisor');
    console.log(`👨‍💼 Supervisores: ${supervisors.length} registros`);

    await connection.end();
    console.log('\n🎉 Novo Railway funcionando perfeitamente!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarNovoRailway();