const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// CREDENCIAIS DO NOVO BANCO RAILWAY
const novoRailwayConfig = {
  host: 'switchyard.proxy.rlwy.net',
  user: 'root', 
  password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
  database: 'railway',
  port: 41445
};

async function migrarParaNovoRailway() {
  let connection;
  
  try {
    console.log('🚀 Conectando ao novo banco Railway...');
    connection = await mysql.createConnection(novoRailwayConfig);
    console.log('✅ Conectado com sucesso!');

    // Ler o script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup_novo_railway.sql'), 'utf8');
    
    // Dividir o script em comandos individuais
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log('📋 Executando comandos SQL...');
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command) {
        try {
          await connection.execute(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
        } catch (error) {
          console.log(`⚠️  Comando ${i + 1} (pode ser normal se já existir):`, error.message);
        }
      }
    }

    // Verificar se as tabelas foram criadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tabelas criadas:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('💡 Agora atualize o arquivo .env com as novas credenciais do Railway');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar migração
migrarParaNovoRailway();