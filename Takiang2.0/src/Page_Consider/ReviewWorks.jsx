import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Navbar from '../Component/Navbar_C';

function ReviewWorks() {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
  try {
    // ดึง submitted_works ทั้งหมด
    const res = await axios.get('/api/submitted-works/');
    const allWorks = res.data;

    // ดึง reviewed_works ทั้งหมด (ต้องมี API สำหรับนี้ด้วย)
    const reviewedRes = await axios.get('/api/reviewed-works/');
    const reviewedWorks = reviewedRes.data;

    // กรองเฉพาะงานที่ status = 'ผ่าน' และยังไม่อยู่ใน reviewed_works
    const unreviewed = allWorks.filter(sw => 
      sw.status === 'ผ่าน' &&
      !reviewedWorks.some(rw => 
        rw.username === sw.username &&
        rw.project_id === sw.project_id &&
        rw.works_id === sw.works_id &&
        rw.round_number === sw.round_number
      )
    );

    setWorks(unreviewed);
  } catch (err) {
    console.error('Error fetching works:', err);
  }
};


  const handlePass = async (work) => {
    try {
      // เรียก API บันทึกงานที่ผ่าน
      await axios.post('/api/reviewed-works', {
        submitted_id: work.submitted_id,
        username: work.username,
        project_id: work.project_id,
        works_id: work.works_id,
        round_number: work.round_number,
        link: work.link,
        reviewer_comment: 'ตรวจสอบแล้ว - ผ่าน'
      });
      Swal.fire('สำเร็จ', 'บันทึกผลการตรวจสอบแล้ว', 'success');

      // ซ่อนแถวงานนั้นจากตาราง
      setWorks(prev => prev.filter(w => w.submitted_id !== work.submitted_id));

    } catch (error) {
      console.error(error);
      Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกงานได้', 'error');
    }
  };

const handleFail = async (work) => {
  try {
    const { value: comment } = await Swal.fire({
      title: 'กรุณาใส่คอมเมนต์',
      input: 'textarea',
      
      inputPlaceholder: 'ใส่คอมเมนต์ที่นี่...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'คุณต้องใส่คอมเมนต์ก่อน!';
        }
      }
    });

    if (comment) {
      await axios.put(`/api/submitted-works/fail/${work.submitted_id}`, {
        reviewer_comment: comment
      });
      Swal.fire('อัปเดตแล้ว', 'สถานะงานถูกเปลี่ยนเป็นไม่ผ่าน', 'success');

      // ซ่อนแถวงานนั้นจากตาราง
      setWorks(prev => prev.filter(w => w.submitted_id !== work.submitted_id));
    }

  } catch (error) {
    Swal.fire('ผิดพลาด', 'ไม่สามารถอัปเดตได้', 'error');
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">
          <h3>รายการงานที่ผ่านการตรวจสอบจากแอดมินเเล้ว</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>ผู้รับผิดชอบ</th>
                <th>ชื่อโปรเจค</th>
                <th>ชื่องาน</th>
                <th>ลิงก์งาน</th>
                <th>คอมเมนต์แอดมิน</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {works.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>ไม่มีงานที่ตรงตามสถานะ</td>
                </tr>
              ) : (
                works.map(work => (
                  <tr key={work.submitted_id}>
                    <td>{work.username}</td>
                    
                    <td>{work.project_name}</td>
                    <td>{work.works_name}</td>
                    
                    <td><a href={work.link} target="_blank" rel="noopener noreferrer">เปิดงาน</a></td>
                    <td>{work.reviewer_comment || '-'}</td>
                    <td>
                      <button onClick={() => handlePass(work)} className='button-save'>ผ่าน</button>
                      <button onClick={() => handleFail(work)} className='button-cancel'>ไม่ผ่าน</button>
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
