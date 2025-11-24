// Versão temporária que simula análise inteligente sem usar Gemini
// Use esta versão enquanto gera a nova chave API

const express = require('express');
const app = express();

app.use(express.json());

// Simulação mais inteligente de análise de componentes
app.post('/api/gemini/analisar-componentes', (req, res) => {
  const { imageBase64 } = req.body;
  
  console.log('🔍 Simulando análise inteligente...');
  console.log('Tamanho da imagem:', imageBase64 ? imageBase64.length : 'undefined');
  
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'Imagem é obrigatória' });
  }

  // Simulação baseada no tamanho da imagem e timestamp
  const tamanho = imageBase64.length;
  const agora = new Date();
  const seed = tamanho + agora.getSeconds() + agora.getMilliseconds();
  
  // Diferentes cenários baseados no "seed"
  const cenarios = [
    {
      probabilidade: 0.3,
      resultado: "2 resistores\n1 led vermelho\n3 fios\n1 protoboard"
    },
    {
      probabilidade: 0.25,
      resultado: "1 resistor 220Ω\n1 capacitor 100μF\n2 fios jumper\n1 led azul"
    },
    {
      probabilidade: 0.2,
      resultado: "3 resistores\n1 transistor BC547\n2 capacitores\n4 fios"
    },
    {
      probabilidade: 0.15,
      resultado: "1 Arduino Uno\n2 resistores\n1 sensor ultrassônico\n5 fios"
    },
    {
      probabilidade: 0.1,
      resultado: "Nenhum componente eletrônico identificado"
    }
  ];
  
  // Selecionar cenário baseado no seed
  const random = (seed % 100) / 100;
  let acumulado = 0;
  let cenarioEscolhido = cenarios[cenarios.length - 1]; // fallback
  
  for (const cenario of cenarios) {
    acumulado += cenario.probabilidade;
    if (random <= acumulado) {
      cenarioEscolhido = cenario;
      break;
    }
  }
  
  // Adicionar pequena variação no tempo de resposta para parecer real
  const delay = 1000 + (seed % 2000); // 1-3 segundos
  
  setTimeout(() => {
    console.log('✅ Análise simulada concluída:', cenarioEscolhido.resultado);
    res.json({ 
      success: true, 
      resultado: cenarioEscolhido.resultado,
      simulado: true,
      timestamp: new Date().toISOString()
    });
  }, delay);
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Versão temporária funcionando!',
    status: 'Simulação inteligente ativa'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor temporário rodando na porta ${PORT}`);
  console.log('📝 Esta versão simula análise inteligente sem usar Gemini');
  console.log('🔑 Gere uma nova chave API para usar o Gemini real');
});

module.exports = app;