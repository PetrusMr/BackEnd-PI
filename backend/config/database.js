const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'q1w2e3',
  database: process.env.DB_NAME || 'easycontrol',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  reconnect: true,
  idleTimeout: 300000,
  ssl: false
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;