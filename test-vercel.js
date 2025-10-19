const axios = require('axios');

// SUBSTITUA pela sua URL do Vercel
const API_URL = process.argv[2] || 'https://seu-projeto.vercel.app';

console.log(`🚀 Testando API em: ${API_URL}\n`);

async function test1_Servidor() {
    console.log('1️⃣ Testando se servidor está rodando...');
    try {
        const response = await axios.get(`${API_URL}/`);
        console.log('✅ Servidor OK:', response.data.message);
        return true;
    } catch (error) {
        console.log('❌ Servidor Error:', error.message);
        return false;
    }
}

async function test2_Env() {
    console.log('\n2️⃣ Testando variáveis de ambiente...');
    try {
        const response = await axios.get(`${API_URL}/api/test-env`);
        console.log('✅ ENV:', response.data);
        
        if (!response.data.hasGeminiKey) {
            console.log('⚠️  GEMINI_API_KEY não configurada no Vercel!');
        }
        if (!response.data.hasDbHost) {
            console.log('⚠️  DB_HOST não configurada no Vercel!');
        }
        
        return response.data.hasGeminiKey && response.data.hasDbHost;
    } catch (error) {
        console.log('❌ ENV Error:', error.response?.data || error.message);
        return false;
    }
}

async function test3_Database() {
    console.log('\n3️⃣ Testando conexão com banco...');
    try {
        const response = await axios.get(`${API_URL}/api/test-db`);
        console.log('✅ Database:', response.data.message);
        return true;
    } catch (error) {
        console.log('❌ Database Error:', error.response?.data || error.message);
        return false;
    }
}

async function test4_Gemini() {
    console.log('\n4️⃣ Testando API Gemini...');
    try {
        const response = await axios.get(`${API_URL}/api/gemini/test-api`);
        console.log('✅ Gemini:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Gemini Error:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    const results = [];
    
    results.push(await test1_Servidor());
    results.push(await test2_Env());
    results.push(await test3_Database());
    results.push(await test4_Gemini());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`\n📊 Resultado: ${passed}/${total} testes passaram`);
    
    if (passed === total) {
        console.log('🎉 Todos os testes passaram! Sua API está funcionando.');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique as configurações no Vercel.');
    }
}

runTests();