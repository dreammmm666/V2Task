import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar_admin'
import '../Css/Table.css'  

function MyWorkTable() {
  const [works, setWorks] = useState([]);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const username = localStorage.getItem('username');
    console.log('username from localStorage:', username);
    if (!username) return;

    axios.get(`/api/works/user/${username}`)
      .then(res => {
        setWorks(res.data);
        setCurrentPage(1); // reset page when data loads
      })
      .catch(err => console.error('Error fetching works:', err));
  }, []);

  // คำนวณขอบเขตข้อมูลแสดงในแต่ละหน้า
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentWorks = works.slice(indexOfFirst, indexOfLast);

  // ฟังก์ชันเปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(works.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">
           <p style={{ fontSize: '20px' }}>งานของฉัน</p>
          <table className="styled-table">
            <thead>
              <tr>
                <th>ชื่อโปรเจกต์</th>
               
                <th>ชื่องาน</th>
                <th>ประเภทงาน</th>
                <th>ราคา</th>
                <th>รายละเอียด</th>
                <th>วันครบกำหนด</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {currentWorks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>ไม่พบงานที่รับผิดชอบ</td>
                </tr>
              ) : (
                currentWorks.map((work) => (
                  <tr
                    key={work.work_id}
                    className={
                      work.status?.trim() === 'เสร็จสิ้น'
                        ? 'row-complete'
                        : work.status?.trim() === 'กำลังดำเนินการ'
                        ? 'row-in-progress'
                        : work.status?.trim() === 'ยกเลิก'
                        ? 'row-cancelled'
                        : ''
                    }
                  >
                    <td>{work.project_name}</td>
                    <td>{work.works_name}</td>
                    <td>{work.work_type}</td>
                    <td>{work.price}</td>
                    <td>{work.description}</td>
                    <td>{work.due_date ? new Date(work.due_date).toLocaleDateString('th-TH') : '-'}</td>
                    <td>{work.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ปุ่ม Pagination */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
            <span>หน้า {currentPage} / {Math.ceil(works.length / rowsPerPage)}</span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(works.length / rowsPerPage)} className='BBB'>ถัดไป</button>
          </div>

        </div>
      </div>
    </>
  );
}

export default MyWorkTable;
