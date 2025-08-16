import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar_admin'
import '../Css/Table.css';

function SubmitWork() {
  const [submittedWorks, setSubmittedWorks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;

    axios.get(`/api/submitted-works/${username}`)
      .then(res => {
        setSubmittedWorks(res.data);
        setCurrentPage(1); // รีเซ็ตหน้าเมื่อโหลดข้อมูลใหม่
      })
      .catch(err => console.error('Error fetching submitted works:', err));
  }, [username]);

  // ฟังก์ชันกำหนดสีสถานะ
  const getStatusColor = (status) => {
    switch(status) {
      case 'ผ่าน': return '#d4edda';        // เขียวอ่อน
      case 'ไม่ผ่าน': return '#f8d7da';    // แดงอ่อน
      case 'รอดําเนินการ': return '#fff3cd'; // เหลืองอ่อน
      default: return 'transparent';
    }
  };

  // กรองข้อมูลตามสถานะ
  const filteredWorks = filterStatus === 'ทั้งหมด'
    ? submittedWorks
    : submittedWorks.filter(w => w.status === filterStatus);

  // คำนวณข้อมูลหน้าปัจจุบัน
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentWorks = filteredWorks.slice(indexOfFirst, indexOfLast);

  // ฟังก์ชันเปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredWorks.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // format วันที่
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
          <h3>รายการส่งงานของฉัน</h3>

          <label style={{fontSize:'20px'}}>กรองสถานะ: </label>
          <select
            className='select-custom'
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1); // รีเซ็ตหน้าเวลาเปลี่ยน filter
            }}
            style={{ marginBottom: '10px' }}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="ผ่าน">ผ่าน</option>
            <option value="ไม่ผ่าน">ไม่ผ่าน</option>
            <option value="รอดําเนินการ">รอดําเนินการ</option>
          </select>

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
                    ไม่มีข้อมูล
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
                      <a href={item.link} target="_blank" rel="noreferrer" style={{color:'black'}}>
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

          {/* ปุ่ม Pagination */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
            <span>หน้า {currentPage} / {Math.ceil(filteredWorks.length / rowsPerPage)}</span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredWorks.length / rowsPerPage)} className='BBB'>ถัดไป</button>
          </div>

        </div>
      </div> 
    </>
  );
}

export default SubmitWork;
