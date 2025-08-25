import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar_admin';
import '../Css/Table.css';

function SubmitWork() {
  const [submittedWorks, setSubmittedWorks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedWorkGroup, setSelectedWorkGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;
    axios.get(`/api/submitted-works/${username}`)
      .then(res => setSubmittedWorks(res.data))
      .catch(err => console.error('Error fetching submitted works:', err));
  }, [username]);

  // กำหนดสีตามสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case 'ผ่าน': return '#d4edda';        // เขียวอ่อน
      case 'ไม่ผ่าน': return '#f8d7da';     // แดงอ่อน
      case 'รอดําเนินการ': return '#fff3cd'; // เหลืองอ่อน
      default: return 'transparent';
    }
  };

  // จัดกลุ่มงานตาม project_id + works_id
  const groupByWork = (data) => {
    const grouped = {};
    data.forEach(item => {
      const key = `${item.project_id}-${item.works_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return Object.values(grouped);
  };

  const filteredWorks = filterStatus === 'ทั้งหมด'
    ? submittedWorks
    : submittedWorks.filter(w => w.status === filterStatus);

  const groupedWorks = groupByWork(filteredWorks);

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentGroups = groupedWorks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(groupedWorks.length / rowsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleRowClick = (workGroup) => {
    setSelectedWorkGroup(workGroup);
    setShowModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">
          <h3>รายการส่งงานของฉัน</h3>

          <label style={{ fontSize: '20px' }}>กรองสถานะ: </label>
          <select
            className='select-custom'
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ marginBottom: '10px' }}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="ผ่าน">ผ่าน</option>
            <option value="ไม่ผ่าน">ไม่ผ่าน</option>
            <option value="รอดําเนินการ">รอดําเนินการ</option>
          </select>

          <table className="styled-table" border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#eee' }}>
              <tr>
                <th>โปรเจค</th>
                <th>งาน</th>
                <th>จำนวนรอบที่ส่ง</th>
              </tr>
            </thead>
            <tbody>
              {currentGroups.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>ไม่มีข้อมูล</td></tr>
              ) : (
                currentGroups.map((group, idx) => (
                  <tr
                    key={idx}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: getStatusColor(group[group.length - 1].status)
                    }}
                    onClick={() => handleRowClick(group)}
                  >
                    <td>{group[0].project_name}</td>
                    <td>{group[0].works_name}</td>
                    <td>{group.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
            <span>หน้า {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className='BBB'>ถัดไป</button>
          </div>
        </div>
      </div>

      {/* Modal แสดงรายละเอียดรอบการส่ง */}
      {showModal && selectedWorkGroup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>รายละเอียดการส่งงาน: {selectedWorkGroup[0].works_id}</h3>
            <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '10px' }} className="styled-table">
              <thead>
                <tr>
                  <th>รอบ</th>
                  <th>ลิงก์งาน</th>
                  <th>วันที่ส่ง</th>
                  <th>สถานะ</th>
                  <th>หมายเหตุผู้ตรวจ</th>
                </tr>
              </thead>
              <tbody>
                {selectedWorkGroup.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: getStatusColor(item.status) }}>
                    <td>{item.round_number}</td>
                    <td>
                      <a href={item.link} target="_blank" rel="noreferrer">
                        ลิงก์งาน
                      </a>
                    </td>
                    <td>{formatDate(item.submitted_date)}</td>
                    <td>{item.status}</td>
                    <td>{item.reviewer_comment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowModal(false)} className="BBB" style={{ marginTop: '10px' }}>ปิด</button>
          </div>
        </div>
      )}
    </>
  );
}

export default SubmitWork;
