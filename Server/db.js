const mysql = require('mysql2/promise');  // <-- เปลี่ยนเป็น require ตัว promise wrapper
require('dotenv').config();

const connection = mysql.createPool({    // <-- แนะนำใช้ createPool เพื่อจัดการ connection หลายๆ ตัวได้ดี
  host: 'shuttle.proxy.rlwy.net',
  user: 'root',
  password: 'bVFNSxyxKbKZJMQMqxXiFoQFiXgCDYIj',
  database: 'railway',
  port: 59143,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = connection;
