const mysql = require('mysql2/promise');  // <-- เปลี่ยนเป็น require ตัว promise wrapper
require('dotenv').config();

const connection = mysql.createPool({  // <-- แนะนำใช้ createPool เพื่อจัดการ connection หลายๆ ตัวได้ดี
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
