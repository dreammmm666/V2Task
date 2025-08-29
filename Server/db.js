const mysql = require('mysql2/promise');  
require('dotenv').config();

const connection = mysql.createPool({  
  host: 'turntable.proxy.rlwy.net',
  user: 'root',
  password: 'LtOqcrnXBVZyIsHjHxEmGGMLNzPtfboV',
  database: 'railway',
  port: 22318,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = connection;
