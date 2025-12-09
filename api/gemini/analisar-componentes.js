module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  // Retornar resultado simulado por enquanto
  res.json({ 
    success: true, 
    resultado: '2 resistores\n1 led vermelho\n1 protoboard\n3 fios jumper' 
  });
};