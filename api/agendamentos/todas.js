const mysql = require('mysql2');

const dbConfig = {
  host: 'sql10.freesqldatabase.com',
  user: 'sql10804387',
  password: 'PfvDQC2YPa',
  database: 'sql10804387',
  port: 3306,
  acquireTimeout: 60000,
  timeout: 60000
};

function createConnection() {
  return mysql.createConnection(dbConfig);
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const db = createConnection();
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