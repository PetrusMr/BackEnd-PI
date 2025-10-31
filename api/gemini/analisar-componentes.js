module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { imageBase64 } = req.body;
  
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'Imagem é obrigatória' });
  }

  // Simulação de análise de componentes
  const resultados = [
    'Componente identificado: Resistor 220Ω',
    'Componente identificado: LED vermelho', 
    'Componente identificado: Capacitor 100μF',
    'Análise concluída com sucesso'
  ];
  
  const resultado = resultados[Math.floor(Math.random() * resultados.length)];
  
  res.json({ 
    success: true, 
    resultado: resultado
  });
};