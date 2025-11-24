const mysql = require('mysql2/promise');

async function adicionarSupervisorTabela() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    // Adicionar supervisor na tabela supervisor (se não existir)
    await connection.execute(`
      INSERT IGNORE INTO supervisor (usuario, senha, nome) VALUES 
      ('supervisor', 'super123', 'Supervisor')
    `);
    console.log('✅ Supervisor adicionado na tabela supervisor');

    // Verificar tabela supervisor
    const [supervisors] = await connection.execute('SELECT * FROM supervisor');
    console.log('\n👨💼 SUPERVISORES:');
    supervisors.forEach(sup => {
      console.log(`  - Usuario: "${sup.usuario}" | Senha: "${sup.senha}"`);
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

adicionarSupervisorTabela();