require('dotenv').config();
const { db } = require('./firebase-config');

async function seedFirestore() {
  try {
    console.log('🌱 Criando dados de exemplo no Firestore...');

    // Criar usuários de exemplo
    await db.collection('usuarios').add({
      usuario: 'admin',
      senha: '123',
      email: 'admin@teste.com',
      created_at: new Date()
    });

    await db.collection('usuarios').add({
      usuario: 'user1',
      senha: 'pass1',
      email: 'user1@teste.com',
      created_at: new Date()
    });

    // Criar agendamentos de exemplo
    await db.collection('agendamentos').add({
      nome: 'admin',
      data: '2024-12-20',
      horario: 'manha',
      user_id: 'admin',
      created_at: new Date()
    });

    await db.collection('agendamentos').add({
      nome: 'user1',
      data: '2024-12-21',
      horario: 'tarde',
      user_id: 'user1',
      created_at: new Date()
    });

    console.log('✅ Dados de exemplo criados com sucesso!');
    console.log('👤 Usuários: admin/123, user1/pass1');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
  }
}

seedFirestore();