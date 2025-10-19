const axios = require('axios');

const API_URL = 'https://seu-projeto.vercel.app'; // SUBSTITUA pela sua URL

async function testEnv() {
    console.log('🔍 Testando variáveis de ambiente...');
    try {
        const response = await axios.get(`${API_URL}/api/test-env`);
        console.log('✅ ENV:', response.data);
    } catch (error) {
        console.log('❌ ENV Error:', error.response?.data || error.message);
    }
}

async function testGemini() {
    console.log('🤖 Testando API Gemini...');
    try {
        const response = await axios.get(`${API_URL}/api/gemini/test-api`);
        console.log('✅ Gemini:', response.data);
    } catch (error) {
        console.log('❌ Gemini Error:', error.response?.data || error.message);
    }
}

async function testImageAnalysis() {
    console.log('📸 Testando análise de imagem...');
    
    // Imagem de teste simples (1x1 pixel vermelho em base64)
    const testImage = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    try {
        const response = await axios.post(`${API_URL}/api/gemini/analisar-componentes`, {
            imageBase64: testImage
        });
        console.log('✅ Análise:', response.data);
    } catch (error) {
        console.log('❌ Análise Error:', error.response?.data || error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Iniciando testes da API...\n');
    
    await testEnv();
    console.log('');
    
    await testGemini();
    console.log('');
    
    await testImageAnalysis();
    console.log('');
    
    console.log('✨ Testes concluídos!');
}

runAllTests();