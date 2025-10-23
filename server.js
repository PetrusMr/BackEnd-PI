const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configuração Firebase
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "projeto-pi-ffde3",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "45d48bad150ba2cbcaccea242b6648b6d0a31eb5",
  private_key: (process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCiByQSqABpuyGU
ngy1hnb48mXvbfgY1QlP+giMxQLFNqtSEKxbV3Q9o9iHUqgKpUffhDeDDKdirMUp
REf4MZ4thpLdctPWpSSLjqqsnRJdjNR4X7wL0ALohejslDVmDMWrxI/ju7S4w1hE
h5XDPyegFDmJeyah81gKTH1JrMJPLmAmmypGxYXx6SJHERbQRQlb4Nh6V/GWo7TV
gPW1UlE0k27iVS1PLMnA9kL1pJF/w9pQBsi7c+cBBv/67iPCM74amqspor6ZNdKQ
R5NOQnOoKRjH2QGSUpUCUA/igL+Q1uHhTcBglbxiDHxSOqEe0qcxJQToDGNdkBFj
MrRTO2fpAgMBAAECggEAGaDDhefo2NBuiVFOdU/ldY7xrKNaQKNBq9LCk3F99K+m
/X4BpRj6G93Um+LpDXYDHkmNdj8EIsltDg/sykce29iTVk+ZTjQkyaYxPMhDZWSn
HrsVxVCLhTfZFcKDh7axdW/LypugBDFxvrUrbQyKOfm4+BPwkmEpJcffcU3QFjHg
0eBV1AhB1Meor1yQQr15Q3I7Bh5oBWkfqf1CWx0h/kMGxrkgf58rjMDMZ5WfyKor
VWagrI9ahFzOOQmUlj+MvtrKEjgl3HFg+kXWJiJHIKk17PtCzZvxFHnpIlFCrys9
xWpQ+NoE880ficax1BHf82B9YvA2Gi09KIEpQHM/YQKBgQDj2lXDga6zKVql09eX
Gj0Y/4dX7RTI+rTI42XvYs3xB2TyCZcP9Vwo9LpyGXUZCGGFYijUC6Ruz8X128Gm
S21xnTes/3ivFDWRggvlZPBFRqi5PLCIDdBp8sGCBmfcNCvGfwlyLBCsoaHW8237
LoyGAB/cUdf+oO4aJnuAsI1lpQKBgQC2CyTCrgVXhi+d6a+OP+QtyC91Ltaj8jF5
0njDPQtJt8zpkK6GovkZz4jKLsS/4WGKoRAi8B5Sg1xWyEw1jZcnb4TaYTsyn3HS
Ol6jfYle3GGJuEX3mDKUjWJCSLN2C91Qz19Dmzss8mZQ1oU8nYycpCSA9q16QyTf
I90KzDTN9QKBgQDVNJxD0Lk0FGIqAUwerAK3vYNblxB373/y6jWcBoxGGXEvuiGM
YT7XZAiCc6fKwLjgIrWplStMNUc7g2J0xOeoBEDwtCytRu/JNDMFd6oMaM3AZzWY
WbTHLsw7atsMhhTgLEceenUv1B6oECi9fRUo3jzx3/OI4/VoqtGt3YaxsQKBgQCK
BPjiAT5blYkUmNBZcWd2rogMuG5T7pREYKben7GnOotJqkAoI/fo8cgsQjk5oY9q
o6KwWo0i0iV4RnRBRhCL/akkSQOw5eJOGaMXIV69ZSkuWV/y0JnIt0kAKE6n+Wba
ld8MSu0ars2UDJEH3At315s1i9ELGU0jQPWd8iU24QKBgD1vLOEgIQJLMZ2hOsGh
VqUGGanLwmkzhMMfdwDtapoIg1ShJ0pDZbmOiHDrZqno5MHokBO7Uepsw+Q98+4e
gklJn95+Mt2Ds/CPXZdRD8o+gbVEgljS4zcG1HCbvcwWVPbPYje4newd9fAyMaLO
Epl7ip5VdfnIjD738lBGe7rs
-----END PRIVATE KEY-----`).replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@projeto-pi-ffde3.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "102938162237868092581",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Rota raiz
app.get('/', async (req, res) => {
  try {
    // Testar conexão Firestore
    const testDoc = await db.collection('test').add({ test: true, timestamp: new Date() });
    await db.collection('test').doc(testDoc.id).delete();
    
    res.json({ 
      message: '🚀 RAILWAY + FIRESTORE FUNCIONANDO!', 
      timestamp: new Date().toISOString(),
      status: 'ONLINE',
      firestore: 'CONECTADO'
    });
  } catch (error) {
    res.json({ 
      message: '🚀 RAILWAY FUNCIONANDO (Firestore com problema)', 
      timestamp: new Date().toISOString(),
      status: 'ONLINE',
      firestore: 'ERRO: ' + error.message
    });
  }
});

// Login com Firestore
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 Login Firestore:', req.body);
    const { usuario, senha } = req.body;
    
    if (!usuario || !senha) {
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
    }
    
    const snapshot = await db.collection('usuarios')
      .where('usuario', '==', usuario)
      .where('senha', '==', senha)
      .get();
    
    if (!snapshot.empty) {
      console.log('✅ Login Firestore sucesso:', usuario);
      res.json({ success: true, message: 'Login realizado com sucesso' });
    } else {
      console.log('❌ Login Firestore falhou:', usuario);
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    console.error('❌ Erro login Firestore:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Login supervisor
app.post('/api/login-supervisor', async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    
    // Verificar se não é usuário comum
    const userSnapshot = await db.collection('usuarios').where('usuario', '==', usuario).get();
    if (!userSnapshot.empty) {
      return res.status(401).json({ success: false, message: 'Acesso negado: usuário não é supervisor' });
    }
    
    // Verificar supervisor
    const supervisorSnapshot = await db.collection('supervisor')
      .where('usuario', '==', usuario)
      .where('senha', '==', senha)
      .get();
    
    if (!supervisorSnapshot.empty) {
      res.json({ success: true, message: 'Login de supervisor realizado com sucesso' });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro login supervisor:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Teste
app.get('/api/test', async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    const usuarios = snapshot.docs.map(doc => doc.data().usuario);
    
    res.json({ 
      success: true, 
      message: 'API RAILWAY + FIRESTORE FUNCIONANDO!',
      usuarios: usuarios,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      success: true, 
      message: 'API RAILWAY FUNCIONANDO (sem Firestore)',
      timestamp: new Date().toISOString()
    });
  }
});

// Agendamentos
app.get('/api/agendamentos/usuario/:nome', async (req, res) => {
  try {
    const { nome } = req.params;
    const snapshot = await db.collection('agendamentos')
      .where('nome', '==', nome)
      .orderBy('data')
      .get();
    
    const agendamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, agendamentos });
  } catch (error) {
    console.error('Erro agendamentos:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const agendamentoData = { ...req.body, created_at: new Date() };
    const docRef = await db.collection('agendamentos').add(agendamentoData);
    res.json({ success: true, id: docRef.id, message: 'Agendamento criado com sucesso' });
  } catch (error) {
    console.error('Erro criar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('agendamentos').doc(id).delete();
    res.json({ success: true, message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    console.error('Erro cancelar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Scans
app.post('/api/scans', async (req, res) => {
  try {
    const scanData = { ...req.body, created_at: new Date() };
    const docRef = await db.collection('scans').add(scanData);
    res.json({ success: true, id: docRef.id, message: 'Scan registrado com sucesso' });
  } catch (error) {
    console.error('Erro registrar scan:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.get('/api/scans/usuario/:nome/:data/:turno', async (req, res) => {
  try {
    const { nome, data, turno } = req.params;
    const snapshot = await db.collection('scans')
      .where('usuario', '==', nome)
      .get();
    
    const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (scans.length === 0) {
      res.json({ 
        success: true, 
        scans: [{ 
          usuario: nome, 
          tipo_scan: 'nenhum', 
          resultado_scan: 'Não scaneado', 
          data_hora: data + ' 00:00:00' 
        }] 
      });
    } else {
      res.json({ success: true, scans });
    }
  } catch (error) {
    console.error('Erro buscar scans:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Histórico Firestore
app.get('/api/historico-reservas', async (req, res) => {
  try {
    const snapshot = await db.collection('historico_agendamentos')
      .orderBy('created_at', 'desc')
      .get();
    
    const historico = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, historico });
  } catch (error) {
    console.error('Erro buscar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Setup inicial - criar dados de exemplo
app.post('/api/setup-firestore', async (req, res) => {
  try {
    // Criar usuários
    await db.collection('usuarios').add({
      usuario: 'admin',
      senha: '123',
      email: 'admin@teste.com',
      created_at: new Date()
    });
    
    await db.collection('usuarios').add({
      usuario: 'petrus',
      senha: '123',
      email: 'petrus@teste.com',
      created_at: new Date()
    });
    
    // Criar supervisor
    await db.collection('supervisor').add({
      usuario: 'supervisor',
      senha: 'admin123',
      email: 'supervisor@teste.com',
      created_at: new Date()
    });
    
    res.json({ success: true, message: 'Firestore configurado com dados iniciais!' });
  } catch (error) {
    console.error('Erro setup:', error);
    res.status(500).json({ success: false, message: 'Erro no setup', error: error.message });
  }
});

// Gemini Vision API
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;
    
    if (!image || !prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Imagem e prompt são obrigatórios' 
      });
    }

    const geminiApiKey = 'AIzaSyDRqQaQ2qzRjhQpMQHZg9rFxljBOisRdHs';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: image.replace(/^data:image\/[a-z]+;base64,/, '')
            }
          }
        ]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const result = data.candidates[0].content.parts[0].text;
      res.json({ success: true, result });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Erro na análise da imagem',
        error: data 
      });
    }
  } catch (error) {
    console.error('Erro Gemini:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Railway rodando na porta ${PORT}`);
});

module.exports = app;