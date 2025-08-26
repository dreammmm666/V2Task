import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Navbar from '../Component/Navbar_C';

function ReviewWorks() {
  const [works, setWorks] = useState([]);

  // ดึงงานที่ผ่าน
  useEffect(() => {
    axios.get('/api/submitted-works/passed')
      .then(res => setWorks(res.data))
      .catch(err => console.error('Error fetching passed works:', err));
  }, []);

  // ฟังก์ชันบันทึกงานผ่าน
  const handlePass = async (work) => {
    try {
      await axios.post('/api/reviewed-works', {
        submitted_id: work.submitted_id,
        username: work.username,
        project_id: work.project_id,
        works_id: work.works_id,
        round_number: work.round_number,
        reviewer_comment: 'ตรวจสอบแล้ว - ผ่าน'
      });
      Swal.fire('สำเร็จ', 'บันทึกผลการตรวจสอบแล้ว', 'success');
      setWorks(works.filter(w => w.submitted_id !== work.submitted_id));
    } catch (error) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกได้', 'error');
    }
  };

  // ฟังก์ชันอัปเดตงานไม่ผ่าน
  const handleFail = async (work) => {
    try {
      await axios.put(`/api/submitted-works/fail/${work.submitted_id}`, {
        reviewer_comment: 'ตรวจสอบแล้ว - ไม่ผ่าน'
      });
      Swal.fire('อัปเดตแล้ว', 'สถานะงานถูกเปลี่ยนเป็นไม่ผ่าน', 'success');
      setWorks(works.filter(w => w.submitted_id !== work.submitted_id));
    } catch (error) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถอัปเดตได้', 'error');
    }
  };

  // แปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">
          <h3>รายการงานที่ผ่านการตรวจสอบชั้นแรก</h3>

          <table className="styled-table" border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#eee' }}>
              <tr>
                <th>ผู้ส่ง</th>
                <th>โปรเจค</th>
                <th>ชื่อโปรเจค</th>
                <th>งาน</th>
                <th>ชื่องาน</th>
                <th>รอบ</th>
                <th>ลิงก์งาน</th>
                <th>วันที่ส่ง</th>
                <th>สถานะ</th>
                <th>หมายเหตุผู้ตรวจ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {works.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center' }}>ไม่มีงานที่รอการตรวจสอบ</td>
                </tr>
              ) : (
                works.map(work => (
                  <tr key={work.submitted_id}>
                    <td>{work.username}</td>
                    <td>{work.project_id}</td>
                    <td>{work.project_name}</td>
                    <td>{work.works_id}</td>
                    <td>{work.works_name}</td>
                    <td>{work.round_number}</td>
                    <td>
                      <a href={work.link} target="_blank" rel="noopener noreferrer">เปิดงาน</a>
                    </td>
                    <td>{formatDate(work.submitted_date)}</td>
                    <td>{work.status}</td>
                    <td>{work.reviewer_comment || '-'}</td>
                    <td>
                      <button onClick={() => handlePass(work)}>ผ่าน</button>
                      <button onClick={() => handleFail(work)}>ไม่ผ่าน</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ReviewWorks;
