const https = require('https');

const data = JSON.stringify({
  usuario: 'admin',
  senha: 'admin123'
});

const options = {
  hostname: 'backend-pi-six.vercel.app',
  port: 443,
  path: '/api/login-supervisor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Erro:', error);
});

req.write(data);
req.end();