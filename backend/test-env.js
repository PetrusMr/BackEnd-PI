require('dotenv').config();

console.log('🔧 Testando variáveis de ambiente:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NÃO DEFINIDA');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NÃO DEFINIDA');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');

if (!process.env.FIREBASE_PROJECT_ID) {
  console.log('❌ Variáveis Firebase não encontradas!');
} else {
  console.log('✅ Variáveis Firebase OK');
}