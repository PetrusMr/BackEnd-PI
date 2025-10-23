require('dotenv').config();
const { db } = require('./firebase-config');

async function testFirebase() {
  try {
    console.log('🔥 Testando conexão Firebase...');
    
    // Testar escrita
    const testDoc = await db.collection('test').add({
      message: 'Teste de conexão',
      timestamp: new Date()
    });
    console.log('✅ Documento criado:', testDoc.id);
    
    // Testar leitura
    const snapshot = await db.collection('test').get();
    console.log('✅ Documentos encontrados:', snapshot.size);
    
    // Limpar teste
    await db.collection('test').doc(testDoc.id).delete();
    console.log('✅ Teste limpo');
    
    console.log('🎉 Firebase funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro Firebase:', error);
  }
}

testFirebase();