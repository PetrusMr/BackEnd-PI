const fetch = require('node-fetch');

module.exports = async (req, res) => {
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

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD61brqsqzlZMLszfWh791tfHM7bURVT-0';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analise esta imagem e identifique componentes eletrônicos visíveis. Procure por:\n\n- Resistores (componentes cilíndricos com listras coloridas)\n- LEDs (pequenas lâmpadas, geralmente redondas ou retangulares)\n- Capacitores (componentes cilíndricos ou retangulares)\n- Fios e cabos\n- Protoboards (placas com furos)\n- Circuitos integrados (chips)\n- Transistores\n- Diodos\n- Sensores\n- Displays\n- Botões e chaves\n- Qualquer outro componente eletrônico\n\nPara cada item encontrado, conte quantos você vê e liste no formato:\nX nome_do_componente\n\nExemplos:\n2 resistores\n1 led vermelho\n3 fios\n1 protoboard\n\nSe realmente não conseguir identificar NENHUM componente eletrônico na imagem, responda apenas: 'Nenhum componente eletrônico identificado'\n\nSeja detalhado e conte todos os itens visíveis, mesmo que pequenos."
            },
            {
              inline_data: {
                mime_type: imageBase64.startsWith('/9j/') ? "image/jpeg" : "image/png",
                data: imageBase64
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    console.log('Resposta completa da API Gemini:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const resultado = data.candidates[0].content.parts[0].text;
      console.log('Resultado extraído:', resultado);
      
      // Verificar se o resultado é válido
      if (resultado && resultado.trim().length > 0) {
        res.json({ 
          success: true, 
          resultado: resultado.trim()
        });
      } else {
        res.json({ 
          success: false, 
          resultado: 'Nenhum componente identificado',
          error: 'Resultado vazio da API'
        });
      }
    } else if (data.error) {
      console.error('Erro da API Gemini:', data.error);
      res.json({ 
        success: false, 
        resultado: 'Erro na análise da imagem',
        error: data.error.message || 'Erro desconhecido da API'
      });
    } else {
      console.error('Estrutura de resposta inesperada:', data);
      res.json({ 
        success: false, 
        resultado: 'Nenhum componente identificado',
        error: 'Resposta inválida da API'
      });
    }
  } catch (error) {
    console.error('Erro na análise:', error);
    console.error('Stack trace:', error.stack);
    
    let mensagemErro = 'Erro na análise da imagem';
    if (error.message) {
      if (error.message.includes('quota')) {
        mensagemErro = 'Limite de uso da API excedido';
      } else if (error.message.includes('invalid')) {
        mensagemErro = 'Imagem inválida ou corrompida';
      } else {
        mensagemErro = error.message;
      }
    }
    
    res.json({ 
      success: false, 
      resultado: 'Nenhum componente identificado',
      error: mensagemErro
    });
  }
};