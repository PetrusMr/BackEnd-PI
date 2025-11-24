module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('🔍 Debug supervisor chamado:', req.method, req.body);
  
  res.json({ 
    success: true, 
    message: 'Debug supervisor funcionando',
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
};