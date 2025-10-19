const https = require('https');

const VERCEL_URL = 'https://back-end-pi-git-main-petrusmrs-projects.vercel.app';

function testarLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      usuario: 'teste',
      senha: '123456'
    });
    
    const options = {
      hostname: 'back-end-pi-git-main-petrusmrs-projects.vercel.app',
      port: 443,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Resposta: ${responseData}`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('Erro:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

console.log('🔐 Testando login...');
testarLogin();