const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node-complete',
  password: 'hdJAFM9qRX2cjz',
});

module.exports = pool.promise();
