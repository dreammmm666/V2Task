import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';

// ===== Helper: บังคับให้ค่ากลายเป็น Array เสมอ =====
const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const x = JSON.parse(val);
      return Array.isArray(x) ? x : (x && typeof x === 'object' ? Object.values(x) : []);
    } catch {
      return [];
    }
  }
  if (val && typeof val === 'object') return Object.values(val);
  return [];
};

function Admin() {
  const [projects, setProjects] = useState([]);               
  const [team, setTeam] = useState('admin');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [works, setWorks] = useState([]);                     

  const [showModal, setShowModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // ===== ใช้ relative path เพื่อให้ proxy ของ Vite ส่งไป Node server =====
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`/api/projects/team/${team}`);
      console.log('Projects fetched:', res.data);  // debug
      setProjects(toArray(res.data));              
      setCurrentPage(1);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดโปรเจกต์:', error);
      setProjects([]);                            
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [team]);

  const handleTeamChange = (e) => setTeam(e.target.value);

  const handleRowClick = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      const res = await axios.get(`/api/works/project/${projectId}`);
      setWorks(toArray(res.data));                 
      setShowModal(true);
    } catch (error) {
      console.error('โหลด works ล้มเหลว:', error);
      setWorks([]);                                
      setShowModal(true);
    }
  };

  const handleEmployeeClick = async (username) => {
    try {
      const res = await axios.get(`/api/employees/${username}`);
      setEmployeeData(res.data || null);
      setShowEmployeeModal(true);
    } catch (error) {
      console.error('โหลดข้อมูลพนักงานล้มเหลว:', error);
      setEmployeeData(null);
      setShowEmployeeModal(true);
    }
  };
  

   const teamNames = {
    admin: 'แอดมิน',
    graphics: 'กราฟิก',
    marketing: 'การตลาด',
  };
  // ===== Pagination (ปลอดภัยด้วย toArray) =====
  const safeProjects = toArray(projects);
  const totalPages = Math.max(1, Math.ceil(safeProjects.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentProjects = safeProjects.slice(indexOfFirst, indexOfLast);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="team-select" style={{ fontWeight: '600', marginRight: '10px' }}>
              เลือกทีม:{' '}
            </label>
            <select
              id="team-select"
              value={team}
              onChange={handleTeamChange}
              className="select-custom"
            >
              <option value="admin">แอดมิน</option>
              <option value="graphics">กราฟิก</option>
              <option value="marketing">การตลาด</option>
            </select>
          </div>

          <p style={{ fontSize: '20px' }}>โปรเจกต์ที่รับผิดชอบโดยทีม: {teamNames[team]}</p>

          {currentProjects.length === 0 ? (
            <p>ยังไม่มีโปรเจกต์</p>
          ) : (
            <>
              <table style={{ marginTop: '1rem' }} className="styled-table">
                <thead>
                  <tr>
                    <th>รหัสโปรเจกต์</th>
                    <th>ชื่อโปรเจกต์</th>
                    <th>ชื่อลูกค้า</th>
                    <th>ราคา (บาท)</th>
                    <th>ทีมที่รับผิดชอบ</th>
                    <th>สถานะ</th>
                    <th>กำหนดส่ง</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project) => {
                    const priceNum = Number(project?.price ?? 0);
                    const dueDateText = project?.due_date
                      ? new Date(project.due_date).toLocaleDateString('th-TH')
                      : '-';
                    const rowClass =
                      project?.status === 'เสร็จสิ้น'
                        ? 'row-complete'
                        : project?.status === 'กำลังดำเนินการ'
                        ? 'row-in-progress'
                        : 'row-default';

                    return (
                      <tr
                        key={project?.project_id ?? `${project?.project_name}-${project?.customer_name}`}
                        className={rowClass}
                        onClick={() => project?.project_id && handleRowClick(project.project_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{project?.project_id ?? '-'}</td>
                        <td>{project?.project_name ?? '-'}</td>
                        <td>{project?.customer_name ?? '-'}</td>
                        <td>{isNaN(priceNum) ? '-' : priceNum.toLocaleString()}</td>
                        <td>{project?.responsible_team ?? '-'}</td>
                        <td>{project?.status ?? '-'}</td>
                        <td>{dueDateText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={prevPage} disabled={currentPage === 1} className="BBB">ก่อนหน้า</button>
                <span>หน้า {currentPage} / {totalPages}</span>
                <button onClick={nextPage} disabled={currentPage === totalPages} className="BBB">ถัดไป</button>
              </div>
            </>
          )}

          {/* Modal งานย่อย */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setShowModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>รายการงานย่อยของโปรเจกต์ {selectedProjectId ?? '-'}</h3>
                <br />
                {toArray(works).length === 0 ? (
                  <p>ไม่พบงานย่อย</p>
                ) : (
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>รหัสงาน</th>
                        <th>ชื่องาน</th>
                        <th>ประเภทงาน</th>
                        <th>ราคา</th>
                        <th>รายละเอียด</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>กำหนดส่ง</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toArray(works).map((work) => {
                        const workRowClass =
                          work?.status === 'เสร็จสิ้น'
                            ? 'row-complete'
                            : work?.status === 'กำลังดำเนินการ'
                            ? 'row-in-progress'
                            : work?.status === 'รอดำเนินการ'
                            ? 'row-pending'
                            : work?.status === 'ยกเลิก'
                            ? 'row-cancelled'
                            : '';

                        const workDue = work?.due_date
                          ? new Date(work.due_date).toLocaleDateString('th-TH')
                          : '-';

                        return (
                          <tr key={work?.work_id ?? `${work?.works_name}-${work?.assigned_to}`} className={workRowClass}>
                            <td>{work?.work_id ?? '-'}</td>
                            <td>{work?.works_name ?? '-'}</td>
                            <td>{work?.work_type ?? '-'}</td>
                            <td>{work?.price ?? '-'}</td>
                            <td>{work?.description ?? '-'}</td>
                            <td
                              onClick={(e) => {
                                e.stopPropagation();
                                if (work?.assigned_to) handleEmployeeClick(work.assigned_to);
                              }}
                              style={{ cursor: work?.assigned_to ? 'pointer' : 'default', color: 'black', textDecoration: work?.assigned_to ? 'underline' : 'none' }}
                              title={work?.assigned_to ? 'คลิกดูข้อมูลพนักงาน' : ''}
                            >
                              {work?.assigned_to ?? '-'}
                            </td>
                            <td>{workDue}</td>
                            <td>{work?.status ?? '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Modal ข้อมูลพนักงาน */}
          {showEmployeeModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setShowEmployeeModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>ข้อมูลพนักงานที่ผูกไว้</h3>
                {employeeData ? (
                  <div style={{ marginTop: '10px' }}>
                    <p><strong>ชื่อ:</strong> {employeeData?.full_name ?? '-'}</p>
                    <p><strong>แผนก:</strong> {employeeData?.department ?? '-'}</p>
                    <p><strong>ตำแหน่ง:</strong> {employeeData?.position ?? '-'}</p>
                  </div>
                ) : (
                  <p style={{ marginTop: '10px' }}>ไม่พบข้อมูลพนักงาน</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Admin;
