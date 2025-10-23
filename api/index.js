require('dotenv').config();

module.exports = (req, res) => {
  const app = require('../backend/server-simple.js');
  return app(req, res);
};