require('dotenv').config();
const mysql = require('mysql2');
const { db } = require('./firebase-config');

// Conexão MySQL atual
const mysqlDb = mysql.createConnection({
  host: 'sql10.freesqldatabase.com',
  user: 'sql10803107',
  password: '88SgnTeTdQ',
  database: 'sql10803107',
  port: 3306
});

async function migrateData() {
  console.log('🚀 Iniciando migração MySQL → Firestore...');

  try {
    // Migrar usuários
    console.log('📋 Migrando usuários...');
    const usuarios = await queryMySQL('SELECT * FROM usuarios');
    for (const usuario of usuarios) {
      await db.collection('usuarios').add({
        usuario: usuario.usuario,
        senha: usuario.senha,
        email: usuario.email || '',
        created_at: new Date()
      });
    }
    console.log(`✅ ${usuarios.length} usuários migrados`);

    // Migrar agendamentos
    console.log('📋 Migrando agendamentos...');
    const agendamentos = await queryMySQL('SELECT * FROM agendamentos');
    for (const agendamento of agendamentos) {
      await db.collection('agendamentos').add({
        nome: agendamento.nome,
        data: agendamento.data,
        horario: agendamento.horario,
        user_id: agendamento.nome, // Usar nome como user_id temporariamente
        created_at: new Date()
      });
    }
    console.log(`✅ ${agendamentos.length} agendamentos migrados`);

    // Migrar histórico
    console.log('📋 Migrando histórico...');
    const historico = await queryMySQL('SELECT * FROM historico_agendamentos');
    for (const item of historico) {
      await db.collection('historico_agendamentos').add({
        nome: item.nome,
        data: item.data,
        horario: item.horario,
        user_id: item.nome,
        created_at: new Date()
      });
    }
    console.log(`✅ ${historico.length} registros de histórico migrados`);

    // Migrar scans
    console.log('📋 Migrando scans...');
    const scans = await queryMySQL('SELECT * FROM scans');
    for (const scan of scans) {
      await db.collection('scans').add({
        usuario: scan.usuario,
        tipo_scan: scan.tipo_scan,
        resultado_scan: scan.resultado_scan,
        data_hora: scan.data_hora,
        agendamento_id: '', // Será necessário mapear depois
        created_at: new Date()
      });
    }
    console.log(`✅ ${scans.length} scans migrados`);

    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    mysqlDb.end();
    process.exit(0);
  }
}

function queryMySQL(query) {
  return new Promise((resolve, reject) => {
    mysqlDb.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Conectar ao MySQL e iniciar migração
mysqlDb.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao MySQL');
  migrateData();
});