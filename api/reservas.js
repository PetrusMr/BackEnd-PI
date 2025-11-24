const mysql = require('mysql2');

const dbConfig = {
  host: 'switchyard.proxy.rlwy.net',
  user: 'root',
  password: 'AgPxpYNuCQwqMvoJhiyWdScWQwZexCNf',
  database: 'railway',
  port: 41445
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const db = mysql.createConnection(dbConfig);
  const query = 'SELECT * FROM agendamentos ORDER BY data, horario';
  
  db.query(query, (err, results) => {
    db.end();
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const reservas = results
      .filter(reserva => {
        const dataReserva = new Date(reserva.data);
        return dataReserva >= hoje;
      })
      .map(reserva => ({
        ...reserva,
        data: new Date(reserva.data).toISOString().split('T')[0]
      }));
    
    res.json({ success: true, reservas });
  });
};