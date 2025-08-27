import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Navbar from '../Component/Navbar_admin';

function ReviewWorks() {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    fetchWorks();
  }, []);

const fetchWorks = async () => {
  try {
    const res = await axios.get('/api/exported-works');
    setWorks(res.data); // ไม่กรองแล้ว ดึงทั้งหมด
  } catch (err) {
    console.error('Error fetching works:', err);
  }
};

  




  

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">
          <h3>รายการงานที่ผ่านการตรวจสอบเเล้ว</h3>

          <table className="styled-table">
            <thead>
              <tr>
                <th>ผู้รับผิดชอบ</th>

                <th>ชื่อโปรเจค</th>
                <th>ชื่องาน</th>

                <th>ลิงก์งาน</th>
                
                
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
