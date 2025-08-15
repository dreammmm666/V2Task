import React, { useState, useEffect } from 'react';
import axios from 'axios';
import feather from 'feather-icons';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2';

function Add_user() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    username: '',
    password: '',
    team: 'admin' // ✅ default เป็น admin
  });

  useEffect(() => {
    feather.replace();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('โหลดรายชื่อพนักงานล้มเหลว:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ✅ ถ้าเป็น team ให้บังคับเป็นตัวเล็ก
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'team' ? value.toLowerCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/register', formData);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'สร้างผู้ใช้สำเร็จแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      setFormData({
        employee_id: '',
        username: '',
        password: '',
        team: 'admin'
      });
    } catch (err) {
      console.error('สร้างผู้ใช้ล้มเหลว:', err);

      let errorMessage = 'เกิดข้อผิดพลาด';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        title: 'ผิดพลาด!',
        text: errorMessage,
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
            <i data-feather="user-plus"></i>
            <h2>สร้างบัญชีผู้ใช้</h2>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>รหัสพนักงาน</label>
              <select
                name="employee_id"
                autoComplete="off"
                value={formData.employee_id}
                onChange={handleChange}
                required
              >
                <option value="">-- เลือกพนักงาน --</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_id} - {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>ชื่อผู้ใช้</label>
              <input
                type="text"
                name="username"
                autoComplete="off"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>ทีม</label>
              <select
                name="team"
                value={formData.team}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="graphics">Graphics</option>
                <option value="marketing">Marketing</option>
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

export default Add_user;
