const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('./db');
const app = express();
const PORT = 3001;
const pool = require('./db');
app.use(cors());
app.use(bodyParser.json());
const cloudinary = require('./cloudinary');

const STATIC_PATH = path.resolve(__dirname, "public");
app.use(express.static(STATIC_PATH));

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://v2taskk.onrender.com', // domain จริงของ frontend
      'https://www.v2taskk.onrender.com' // เพิ่มถ้ามี www
    ]
  : ['http://localhost:5173'];        // local dev

app.use(cors({
  origin: function (origin, callback) {
    // ถ้า origin ไม่มี (เช่น Postman หรือ same-origin) ให้อนุญาต
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // อนุญาต cookie
}));

// สมัครสมาชิก
app.post('/api/register', async (req, res) => {
  const { username, password, employee_id, team } = req.body; // 

  if (!username || !password || !employee_id || !team) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  try {
    // ตรวจสอบ username ซ้ำ
    const [rows] = await db.query(
      'SELECT * FROM user_login_work WHERE username = ?',
      [username]
    );
    if (rows.length > 0) {
      return res.status(409).json({ message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
    }

    // ฟังก์ชันสุ่ม user_id 3 หลักและตรวจสอบไม่ซ้ำ
    async function generateUniqueUserId() {
      while (true) {
        const randomId = Math.floor(100 + Math.random() * 900); // สุ่มเลข 100-999
        const [result] = await db.query(
          'SELECT * FROM user_login_work WHERE user_id = ?',
          [randomId]
        );
        if (result.length === 0) {
          return randomId;
        }
      }
    }

    const userId = await generateUniqueUserId();

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await db.query(
      'INSERT INTO user_login_work (user_id, username, password, employee_id, team) VALUES (?, ?, ?, ?, ?)',
      [userId, username, hashedPassword, employee_id, team]
    );

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user_id: userId });
  } catch (err) {
    console.error('❌ สมัครสมาชิกล้มเหลว:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});



// ล็อกอิน
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM user_login_work WHERE username = ?', [username])

    if (rows.length === 0) {
      return res.status(401).json({ message: 'ไม่พบผู้ใช้งานนี้' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const team = (user.team || '').trim().toLowerCase(); // รับค่า team จาก DB ตัดช่องว่าง+toLowerCase

    res.json({ 
      message: 'ล็อกอินสำเร็จ', 
      user_id: user.user_id, 
      username: user.username, 
      employee_id: user.employee_id, 
      team: team
    });

  } catch (err) {
    console.error('❌ ล็อกอินล้มเหลว:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});


// route: /api/projects/team/:team
app.get('/api/projects/team/:team', async (req, res) => {
  const { team } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.customer_name 
       FROM projects p 
       JOIN customers c ON p.customer_id = c.customer_id 
       WHERE LOWER(TRIM(p.responsible_team)) = ?`,
      [team.toLowerCase().trim()]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/works/project/:project_id', async (req, res) => {
  const { project_id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM works WHERE project_id = ?', [project_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});


app.get('/api/employees/:username', async (req, res) => {
  const username = req.params.username
  try {
    const sql = `
      SELECT e.full_name, e.department, e.position
      FROM user_login_work u
      JOIN employee e ON u.employee_id = e.employee_id
      WHERE u.username = ?
    `
    const [rows] = await db.query(sql, [username])  

    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลพนักงานสำหรับ username นี้' })
    }
  } catch (error) {
    console.error('Error in /api/employees/:username:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
  }
});


//ดึงงานของเเต่ละไอดี
app.get('/api/works/user/:assigned_to', async (req, res) => {
  const { assigned_to } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        w.work_id,
        w.works_name,
        w.description,
        w.due_date,
        w.work_type,
        w.status,
        p.project_name
      FROM works w
      JOIN projects p ON w.project_id = p.project_id
      WHERE w.assigned_to = ?`,
      [assigned_to]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching works:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/works/user/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        w.work_id,
        w.works_name,
        w.description,
        w.due_date,
        w.status,
        p.project_name
      FROM works w
      JOIN projects p ON w.project_id = p.project_id
      WHERE w.assigned_to = ?`,
      [username]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching works:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//
// GET รอบส่งงานล่าสุด
app.get('/api/submit-work/latest-round/:username/:project_id/:works_id', async (req, res) => {
  const { username, project_id, works_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT MAX(round_number) AS latestRound
       FROM submitted_works
       WHERE username = ? AND project_id = ? AND works_id = ?`,
      [username, project_id, works_id]
    );

    res.json({ latestRound: rows[0].latestRound || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรอบส่งงาน' });
  }
});

// POST ส่งงาน
app.post('/api/submit-work', async (req, res) => {
  const { username, project_id, works_id, round_number, link } = req.body;

  try {
    // เช็คก่อนว่ารอบนี้มีอยู่แล้วหรือยัง
    const [existing] = await db.query(
      `SELECT 1 FROM submitted_works WHERE username = ? AND project_id = ? AND works_id = ? AND round_number = ?`,
      [username, project_id, works_id, round_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: `งานรอบที่ ${round_number} นี้ได้ส่งไปแล้ว` });
    }

    // Insert ถ้ายังไม่มี
    await db.query(
      `INSERT INTO submitted_works 
      (username, project_id, works_id, round_number, link, submitted_date, status) 
      VALUES (?, ?, ?, ?, ?, CURDATE(), 'รอดําเนินการ')`,
      [username, project_id, works_id, round_number, link]
    );

    res.json({ message: 'ส่งงานเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งงาน' });
  }
});

app.get('/api/works/inprogress/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT w.work_id AS works_id, w.works_name, w.project_id, p.project_name
       FROM works w
       JOIN projects p ON w.project_id = p.project_id
       WHERE w.assigned_to = ? AND w.status = 'กำลังดำเนินการ'`,
      [username]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching works' });
  }
});


app.get('/api/submitted-works/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT username, project_id, works_id, round_number, link, submitted_date, status, reviewer_comment
       FROM submitted_works
       WHERE username = ?`,
      [username]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching submitted works:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});


// ตัวอย่าง Express API: GET /api/profile/:username
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT e.*
      FROM user_login_work u
      JOIN employee e ON u.employee_id = e.employee_id
      WHERE u.username = ?
    `, [username]);

    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบข้อมูลพนักงาน' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ server' });
  }
});


//เพิ่มข้อมูลลูกค้า
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.json(rows);
  } catch (error) {
    console.error('ดึงข้อมูลลูกค้าล้มเหลว:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  const { customer_name, gender, phone, other_contact } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO customers (customer_name, gender, phone, other_contact)
       VALUES (?, ?, ?, ?)`,
      [customer_name, gender, phone, other_contact]
    );
    res.status(201).json({ message: 'เพิ่มลูกค้าสำเร็จ', customer_id: result.insertId });
  } catch (err) {
    console.error('เพิ่มลูกค้าไม่สำเร็จ:', err);
    res.status(500).json({ error: 'เพิ่มลูกค้าไม่สำเร็จ' });
  }
});


app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT employee_id, full_name FROM employee');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/submitted-works', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM submitted_works ORDER BY submitted_date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

app.put('/api/submitted-works/update', async (req, res) => {
  const { username, project_id, works_id, round_number, status, reviewer_comment } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // อัปเดต submitted_works รอบที่แก้ไข
    await conn.query(
      `UPDATE submitted_works 
       SET status = ?, reviewer_comment = ? 
       WHERE username = ? AND project_id = ? AND works_id = ? AND round_number = ?`,
      [status, reviewer_comment, username, project_id, works_id, round_number]
    );

    // ดึงสถานะทั้งหมดของ submitted_works รอบนั้นๆ
    const [rows] = await conn.query(
      `SELECT status FROM submitted_works WHERE works_id = ?`,
      [works_id]
    );

    // เช็คสถานะรวมของทุกรอบ
    // ถ้ามีรอบไหน 'ไม่ผ่าน' หรือ 'รอดําเนินการ' => works.status = 'กำลังดำเนินการ'
    // ถ้าผ่านหมด => works.status = 'เสร็จสิ้น'
    let worksStatus = 'เสร็จสิ้น';
    for (const row of rows) {
      if (row.status === 'ไม่ผ่าน' || row.status === 'รอดําเนินการ') {
        worksStatus = 'กำลังดำเนินการ';
        break;
      }
    }

    // อัปเดต works.status ตามผลรวม
    await conn.query(
      `UPDATE works 
       SET status = ? 
       WHERE work_id = ? AND project_id = ?`,
      [worksStatus, works_id, project_id]
    );

    await conn.commit();
    res.json({ message: 'อัปเดตสถานะ submitted_works และ works เรียบร้อย' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  } finally {
    conn.release();
  }
});


app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT customer_id, customer_name FROM customers');
    res.json(rows);
  } catch (err) {
    console.error('ดึงข้อมูลลูกค้าล้มเหลว:', err);
    res.status(500).json({ message: 'ดึงข้อมูลลูกค้าล้มเหลว' });
  }
});

// 📌 API เพิ่มโปรเจคใหม่
app.post('/api/projects', async (req, res) => {
  try {
    const { project_name, customer_id, price, responsible_team, status, due_date } = req.body;

    if (!project_name || !customer_id || !price || !responsible_team || !status || !due_date) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // สร้าง project_id อัตโนมัติ เช่น TK001
    const [last] = await db.query('SELECT project_id FROM projects WHERE project_id LIKE "TK%" ORDER BY project_id DESC LIMIT 1');
    let newId = 'TK001';
    if (last.length > 0) {
      const num = parseInt(last[0].project_id.replace('TK', ''), 10) + 1;
      newId = 'TK' + num.toString().padStart(3, '0');
    }

    await db.query(
      `INSERT INTO projects (project_id, project_name, customer_id, price, responsible_team, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, project_name, customer_id, price, responsible_team, status, due_date]
    );

    res.json({ message: 'เพิ่มโปรเจคสำเร็จ', project_id: newId });
  } catch (err) {
    console.error('เพิ่มโปรเจคล้มเหลว:', err);
    res.status(500).json({ message: 'เพิ่มโปรเจคล้มเหลว' });
  }
});


//โพสงานย่อย
function getPrefix(workType) {
  switch (workType) {
    case 'แผ่นอะคริลิกตัดตรงหรือเลเซอร์': return 'AL';
    case 'ฟิล์มโปร่งแสง ใช้กับป้ายไฟ': return 'BL';
    case 'แผ่นพับประชาสัมพันธ์': return 'BR';
    case 'งานตัดพลาสวูดด้วยเครื่อง CNC': return 'CNC-PW';
    case 'งานตัดอะคริลิกด้วยเครื่อง CNC': return 'CNC-AL';
    case 'สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร': return 'STK-DC';
    case 'แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า': return 'FL';
    case 'การ์ดเชิญงานแต่ง, งานบวช ฯลฯ': return 'GC';
    case 'ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ': return 'LG';
    case 'ยิงเลเซอร์แกะลายบนสแตนเลส': return 'LS-ENG';
    case 'ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง': return 'LB';
    case 'พิมพ์นามบัตร 1 หน้า / 2 หน้า': return 'NC';
    case 'กระดาษพีพีกันน้ำ ไม่ยืดหด': return 'PP';
    case 'แผ่นพลาสวูดหนา เบา ตัดง่าย': return 'PW';
    case 'ตรายางหมึกในตัว หรือหมึกแยก': return 'RM';
    case 'ป้ายสแตนเลสกัดกรด': return 'SS-ET';
    case 'งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน': return 'STK';
    case 'สติ๊กเกอร์ติดแผ่นอะคริลิก': return 'STK-AL';
    case 'สติ๊กเกอร์ฝ้า ใช้ติดกระจกเพื่อความเป็นส่วนตัว': return 'STK-FR';
    case 'สติ๊กเกอร์ซีทรู': return 'STK-C2';
    case 'ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด': return 'STK-FB';
    case 'สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด': return 'STK-PP';
    case 'สติ๊กเกอร์ติดแผ่นพลาสวูด': return 'STK-PW';
    case 'สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม': return 'STL';
    case 'ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง': return 'TF';
    case 'ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด': return 'TPW';
    case 'การพิมพ์ระบบแห้งด้วยรังสียูวี': return 'UV';
    case 'วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่': return 'VN';
    
    
    default: return 'TK';
  }
}

// ฟังก์ชันสุ่มเลข 3 หลัก
function randomThreeDigits() {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// ฟังก์ชันสร้าง work_id ที่ไม่ซ้ำ
async function generateUniqueWorkId(workType) {
  const prefix = getPrefix(workType);
  let workId;
  let isUnique = false;

  while (!isUnique) {
    const randomNum = randomThreeDigits();
    workId = prefix + randomNum;

    const [rows] = await db.query('SELECT work_id FROM works WHERE work_id = ?', [workId]);
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  return workId;
}

// API เพิ่มงานย่อย
app.post('/api/works', async (req, res) => {
  try {
    const { works_name, work_type, project_id, description, assigned_to, due_date, status } = req.body;

    if (!works_name || !work_type || !project_id || !assigned_to || !due_date || !status) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const work_id = await generateUniqueWorkId(work_type);

    await db.query(
      `INSERT INTO works 
       (work_id, works_name, work_type, project_id, description, assigned_to, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [work_id, works_name, work_type, project_id, description || '', assigned_to, due_date, status]
    );

    res.json({ message: 'เพิ่มงานย่อยสำเร็จ', work_id });
  } catch (err) {
    console.error('เพิ่มงานย่อยล้มเหลว:', err);
    res.status(500).json({ message: 'เพิ่มงานย่อยล้มเหลว' });
  }
});

// ดึงรายชื่อพนักงานพร้อม username ที่ผูกไว้
app.get('/api/employees-with-users', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.employee_id, e.full_name, u.username
      FROM employee e
      LEFT JOIN user_login_work u 
        ON e.employee_id = u.employee_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees with users:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลพนักงานได้' });
  }
});

// ดึงทีมทั้งหมด (เอามาใส่ใน dropdown ทีม)
app.get('/api/teams', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT team FROM user_login_work
      WHERE team IS NOT NULL AND team <> ''
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลทีมได้' });
  }
});

// ดึงพนักงานตามทีม
app.get('/api/employees-by-team/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const [rows] = await db.query(`
      SELECT e.employee_id, e.full_name, u.username
      FROM employee e
      JOIN user_login_work u ON e.employee_id = u.employee_id
      WHERE u.team = ?
    `, [team]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees by team:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลพนักงานตามทีมได้' });
  }
});



app.get('/api/projects/inprogress', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT project_id, project_name, customer_id, price, responsible_team, due_date, status
       FROM projects
       WHERE status = ?
       ORDER BY (due_date IS NULL), due_date ASC, project_id DESC`,
      ['กำลังดำเนินการ']
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching in-progress projects:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์' });
  }
});

// (option) ถ้าต้องการกรองตามทีมด้วย
app.get('/api/projects/team/:team/inprogress', async (req, res) => {
  const { team } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT project_id, project_name, customer_id, price, responsible_team, due_date, status
       FROM projects
       WHERE status = ? AND responsible_team = ?
       ORDER BY (due_date IS NULL), due_date ASC, project_id DESC`,
      ['กำลังดำเนินการ', team]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching in-progress projects by team:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์ตามทีม' });
  }
});



app.get('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;

  if (!['projects', 'works', 'customers'].includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    let query = '';
    let params = [id];

    if (table === 'projects') {
      query = `
        SELECT project_id, project_name, customer_id, price, responsible_team, 
          DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, status 
        FROM projects WHERE project_id = ?`;
    } else if (table === 'works') {
      query = `
        SELECT work_id, works_name, work_type, description, assigned_to, 
          DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, status 
        FROM works WHERE work_id = ?`;
    } else if (table === 'customers') {
      // สมมติ customers ไม่มีคอลัมน์วันที่ หรือแก้ไขตามจริงถ้ามี
      query = `SELECT * FROM customers WHERE customer_id = ?`;
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: `${table} not found` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  if (!['projects', 'works', 'customers'].includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  let idColumn;
  if (table === 'projects') idColumn = 'project_id';
  else if (table === 'works') idColumn = 'work_id';
  else if (table === 'customers') idColumn = 'customer_id';

  try {
    // แปลงวันที่ใน data ก่อนอัพเดต (เฉพาะ field ที่เป็นวันที่)
    ['due_date', 'date', 'created_at', 'updated_at'].forEach(field => {
      if (data[field]) {
        const d = new Date(data[field]);
        data[field] = d.toISOString().split('T')[0];
      }
    });

    const fields = Object.keys(data);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No data to update' });
    }

    // สร้าง SET clause แบบ dynamic
    const setClause = fields.map(field => `?? = ?`).join(', ');
    const values = [];
    fields.forEach(field => {
      values.push(field, data[field]);
    });

    // กำหนด SQL update statement ตรงนี้
    const sql = `UPDATE ?? SET ${setClause} WHERE ?? = ?`;

    // กำหนด params สำหรับ pool.query
    const params = [table, ...values, idColumn, id];

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `${table} with id ${id} not found` });
    }

    res.json({ message: 'Update successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

//ดึงลูกค้าหน้าแก้ไข
app.get('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
    const [rows] = await pool.query(
      'SELECT customer_id, customer_name, gender, phone, other_contact FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลลูกค้า' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;
  const { customer_name, gender, phone, other_contact } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE customers SET customer_name = ?, gender = ?, phone = ?, other_contact = ? WHERE customer_id = ?`,
      [customer_name, gender, phone, other_contact, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบลูกค้าเพื่อแก้ไข' });
    }

    res.json({ message: 'แก้ไขข้อมูลลูกค้าสำเร็จ' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลลูกค้า' });
  }
});

app.get('/api/works/:id', async (req, res) => {
  const workId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT work_id, works_name, work_type, description, assigned_to, 
              DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, status
       FROM works
       WHERE work_id = ?`,
      [workId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลงานย่อย' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลงานย่อย' });
  }
});

// แก้ไขข้อมูลงานย่อยตาม work_id
app.put('/api/works/:id', async (req, res) => {
  const workId = req.params.id;
  const { works_name, work_type, description, assigned_to, due_date, status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE works 
       SET works_name = ?, work_type = ?, description = ?, assigned_to = ?, due_date = ?, status = ? 
       WHERE work_id = ?`,
      [works_name, work_type, description, assigned_to, due_date, status, workId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบงานย่อยเพื่อแก้ไข' });
    }

    res.json({ message: 'แก้ไขข้อมูลงานย่อยสำเร็จ' });
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลงานย่อย' });
  }
});


// ----- SPA Fallback: ใช้ RegExp แทน "*" -----
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(STATIC_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

