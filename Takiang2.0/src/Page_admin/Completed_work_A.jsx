import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import Navbar from '../Component/Navbar_admin'
import '../Css/Table.css';

function SubmitWork() {
  const [submittedWorks, setSubmittedWorks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;

    axios.get(`/api/submitted-works/${username}`)
      .then(res => {
        setSubmittedWorks(res.data);
        setCurrentPage(1);
      })
      .catch(err => console.error('Error fetching submitted works:', err));
  }, [username]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'ผ่าน': return '#d4edda';
      case 'ไม่ผ่าน': return '#f8d7da';
      case 'รอดําเนินการ': return '#fff3cd';
      default: return 'transparent';
    }
  };

  // กรองเฉพาะงานที่ผ่าน
  const completedWorks = submittedWorks.filter(w => w.status === 'ผ่าน');

  // ตัดข้อมูลสำหรับ pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentWorks = completedWorks.slice(indexOfFirst, indexOfLast);

  // เปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(completedWorks.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
          <h3>รายการงานที่ส่งผ่านแล้ว</h3>

          <div style={{ marginBottom: '10px', fontSize: '20px' }}>
            <h3>✅ งานที่เสร็จสิ้นแล้วทั้งหมด: <strong>{completedWorks.length}</strong> งาน</h3>
          </div>

          <table
            className="styled-table"
            border="1"
            cellPadding="8"
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead style={{ backgroundColor: '#eee' }}>
              <tr>
                <th>โปรเจค</th>
                <th>งาน</th>
                <th>รอบ</th>
                <th>ลิงก์งาน</th>
                <th>วันที่ส่ง</th>
                <th>สถานะ</th>
                <th>หมายเหตุผู้ตรวจ</th>
              </tr>
            </thead>
            <tbody>
              {currentWorks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    ยังไม่มีงานที่ผ่าน
                  </td>
                </tr>
              ) : (
                currentWorks.map((item) => (
                  <tr
                    key={`${item.project_id}-${item.works_id}-${item.round_number}`}
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    <td>{item.project_id}</td>
                    <td>{item.works_id}</td>
                    <td>{item.round_number}</td>
                    <td>
                      <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'black' }}>
                        ลิงก์งาน
                      </a>
                    </td>
                    <td>{formatDate(item.submitted_date)}</td>
                    <td>{item.status}</td>
                    <td>{item.reviewer_comment || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
            <span>หน้า {currentPage} / {Math.ceil(completedWorks.length / rowsPerPage)}</span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(completedWorks.length / rowsPerPage)} className='BBB'>ถัดไป</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubmitWork;
