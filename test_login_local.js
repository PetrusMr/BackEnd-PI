const mysql = require('mysql2/promise');

async function testarLogin() {
  try {
    const connection = await mysql.createConnection({
      host: 'switchyard.proxy.rlwy.net',
      user: 'root',
      password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
      database: 'railway',
      port: 41445
    });

    // Testar login como no código real
    const usuario = 'admin';
    const senha = '123';

    const [rows] = await connection.execute(
      'SELECT * FROM usuarios WHERE usuario = ? AND senha = ?',
      [usuario, senha]
    );

    if (rows.length > 0) {
      console.log('✅ LOGIN FUNCIONOU!');
      console.log('Usuario encontrado:', rows[0]);
    } else {
      console.log('❌ Login falhou - usuário não encontrado');
    }

    await connection.end();

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarLogin();