const mysql = require('mysql2/promise');

async function recriarSupervisores() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    console.log('✅ Conectado ao Railway!');

    // Limpar supervisores existentes
    await connection.execute('DELETE FROM supervisor');
    console.log('🗑️ Supervisores antigos removidos');

    // Inserir supervisores novamente
    await connection.execute(`
      INSERT INTO supervisor (usuario, senha, nome) VALUES 
      ('admin', 'admin123', 'Administrador'),
      ('supervisor', 'super123', 'Supervisor')
    `);
    console.log('✅ Supervisores recriados');

    // Verificar
    const [supervisors] = await connection.execute('SELECT * FROM supervisor');
    console.log('\n👨💼 SUPERVISORES ATUAIS:');
    supervisors.forEach(sup => {
      console.log(`  - Usuario: "${sup.usuario}" | Senha: "${sup.senha}"`);
    });

    await connection.end();
    console.log('\n🎉 Supervisores prontos para uso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

recriarSupervisores();