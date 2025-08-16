import React, { useState, useEffect } from 'react';
import axios from 'axios';
import feather from 'feather-icons';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2';
import Select from 'react-select';

function AddSubWork() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  const workTypeOptions = [
    { value: "แผ่นอะคริลิกตัดตรงหรือเลเซอร์", label: "แผ่นอะคริลิกตัดตรงหรือเลเซอร์" },
    { value: "ฟิล์มโปร่งแสง ใช้กับป้ายไฟ", label: "ฟิล์มโปร่งแสง ใช้กับป้ายไฟ" },
    { value: "แผ่นพับประชาสัมพันธ์", label: "แผ่นพับประชาสัมพันธ์" },
    { value: "งานตัดพลาสวูดด้วยเครื่อง CNC", label: "งานตัดพลาสวูดด้วยเครื่อง CNC" },
    { value: "งานตัดอะคริลิกด้วยเครื่อง CNC", label: "งานตัดอะคริลิกด้วยเครื่อง CNC" },
    { value: "สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร", label: "สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร" },
    { value: "แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า", label: "แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า" },
    { value: "การ์ดเชิญงานแต่ง, งานบวช ฯลฯ", label: "การ์ดเชิญงานแต่ง, งานบวช ฯลฯ" },
    { value: "ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ", label: "ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ" },
    { value: "ยิงเลเซอร์แกะลายบนสแตนเลส", label: "ยิงเลเซอร์แกะลายบนสแตนเลส" },
    { value: "ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง", label: "ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง" },
    { value: "พิมพ์นามบัตร 1 หน้า / 2 หน้า", label: "พิมพ์นามบัตร 1 หน้า / 2 หน้า" },
    { value: "กระดาษพีพีกันน้ำ ไม่ยืดหด", label: "กระดาษพีพีกันน้ำ ไม่ยืดหด" },
    { value: "แผ่นพลาสวูดหนา เบา ตัดง่าย", label: "แผ่นพลาสวูดหนา เบา ตัดง่าย" },
    { value: "ตรายางหมึกในตัว หรือหมึกแยก", label: "ตรายางหมึกในตัว หรือหมึกแยก" },
    { value: "ป้ายสแตนเลสกัดกรด", label: "ป้ายสแตนเลสกัดกรด" },
    { value: "งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน", label: "งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน" },
    { value: "สติ๊กเกอร์ติดแผ่นอะคริลิก", label: "สติ๊กเกอร์ติดแผ่นอะคริลิก" },
    { value: "สติ๊กเกอร์ฝ้า ใช้ติดกระจกเพื่อความเป็นส่วนตัว", label: "สติ๊กเกอร์ฝ้า ใช้ติดกระจกเพื่อความเป็นส่วนตัว" },
    { value: "สติ๊กเกอร์ซีทรู", label: "สติ๊กเกอร์ซีทรู" },
    { value: "ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด", label: "ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด" },
    { value: "สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด", label: "สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด" },
    { value: "สติ๊กเกอร์ติดแผ่นพลาสวูด", label: "สติ๊กเกอร์ติดแผ่นพลาสวูด" },
    { value: "สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม", label: "สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม" },
    { value: "ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง", label: "ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง" },
    { value: "ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด", label: "ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด" },
    { value: "การพิมพ์ระบบแห้งด้วยรังสียูวี", label: "การพิมพ์ระบบแห้งด้วยรังสียูวี" },
    { value: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่", label: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่" },
  ];

  const [formData, setFormData] = useState({
    works_name: '',
    work_type: '',
    project_id: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'เลือกสถานะ',
    team: ''
  });

  useEffect(() => {
    feather.replace();
    fetchProjects();
    fetchTeams();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects/inprogress');
      setProjects(res.data);
    } catch (err) {
      console.error('โหลดโปรเจกต์ล้มเหลว:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('/api/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('โหลดทีมล้มเหลว:', err);
    }
  };

  const fetchEmployeesByTeam = async (team) => {
    try {
      const res = await axios.get(`/api/employees-by-team/${team}`);
      setEmployees(res.data);
    } catch (err) {
      console.error('โหลดข้อมูลพนักงานล้มเหลว:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'team') {
      setFormData(prev => ({
        ...prev,
        assigned_to: ''
      }));
      fetchEmployeesByTeam(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/works', formData);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มงานย่อยเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
      setFormData({
        works_name: '',
        work_type: '',
        project_id: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'เลือกสถานะ',
        team: ''
      });
      setEmployees([]);
    } catch (err) {
      console.error('เพิ่มงานย่อยล้มเหลว:', err);
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'ไม่สามารถเพิ่มงานย่อยได้',
        icon: 'error',
        confirmButtonText: 'ปิด'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card form-card">
          <div className="form-header">
            <i data-feather="file-plus"></i>
            <h2>เพิ่มงานย่อย</h2>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            {/* โปรเจกต์ */}
            <div className="form-group">
              <label>โปรเจกต์</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
              >
                <option value="">-- เลือกโปรเจกต์ --</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* ทีม */}
            <div className="form-group">
              <label>ทีม</label>
              <select
                name="team"
                value={formData.team}
                onChange={handleChange}
                required
              >
                <option value="">-- เลือกทีม --</option>
                {teams.map((t, index) => (
                  <option key={index} value={t.team}>
                    {t.team}
                  </option>
                ))}
              </select>
            </div>

            {/* ผู้รับผิดชอบ */}
            <div className="form-group">
              <label>ผู้รับผิดชอบ</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                required
                disabled={!formData.team}
              >
                <option value="">-- เลือกผู้รับผิดชอบ --</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.username}>
                    {emp.full_name} ({emp.username})
                  </option>
                ))}
              </select>
            </div>

            {/* ชื่องานย่อย */}
            <div className="form-group">
              <label>ชื่องาน</label>
              <input
                type="text"
                name="works_name"
                autoComplete="off"
                value={formData.works_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* ประเภทงาน */}
            <div className="form-group">
              <label>ประเภทงาน</label>
              <Select
                options={workTypeOptions}
                value={workTypeOptions.find(opt => opt.value === formData.work_type) || null}
                onChange={(selected) => setFormData(prev => ({ ...prev, work_type: selected?.value || '' }))}
                placeholder="-- เลือกประเภทงาน --"
                isSearchable
                maxMenuHeight={150} // สูงประมาณ 5 ตัวเลือก
              />
            </div>

            {/* รายละเอียด */}
            <div className="form-group">
              <label>รายละเอียด</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* วันครบกำหนด */}
            <div className="form-group">
              <label>วันครบกำหนด</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* สถานะ */}
            <div className="form-group">
              <label>สถานะ</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">เลือกสถานะ</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>
            </div>

            <button type="submit" className="btn-submit">
              บันทึก
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddSubWork;
