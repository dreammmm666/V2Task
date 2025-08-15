import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../Css/Table.css' 
import Navbar from '../Component/Navbar_admin'

function Admin() {
  const [projects, setProjects] = useState([])
  const [team, setTeam] = useState('admin')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [works, setWorks] = useState([])
  const [showModal, setShowModal] = useState(false)

  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [employeeData, setEmployeeData] = useState(null)

  // สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10 // กำหนดจำนวนแถวต่อหน้า

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/projects/team/${team}`)
        setProjects(res.data)
        setCurrentPage(1) // รีเซ็ตไปหน้าแรกทุกครั้งที่ทีมเปลี่ยน
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดโปรเจกต์:', error)
      }
    }

    fetchProjects()
  }, [team])

  const handleTeamChange = (e) => {
    setTeam(e.target.value)
  }

  const handleRowClick = async (projectId) => {
    setSelectedProjectId(projectId)
    try {
      const res = await axios.get(`http://localhost:3001/api/works/project/${projectId}`)
      setWorks(res.data)
      setShowModal(true)
    } catch (error) {
      console.error('โหลด works ล้มเหลว:', error)
    }
  }

  const handleEmployeeClick = async (username) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/employees/${username}`)
      setEmployeeData(res.data)
      setShowEmployeeModal(true)
    } catch (error) {
      console.error('โหลดข้อมูลพนักงานล้มเหลว:', error)
      setEmployeeData(null)
    }
  }

  // คำนวณขอบเขตของข้อมูลที่จะแสดงในแต่ละหน้า
  const indexOfLast = currentPage * rowsPerPage
  const indexOfFirst = indexOfLast - rowsPerPage
  const currentProjects = projects.slice(indexOfFirst, indexOfLast)

  // ฟังก์ชันเปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(projects.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="team-select" style={{ fontWeight: '600', marginRight: '10px' }}>เลือกทีม: </label>
            <select id="team-select" value={team} onChange={handleTeamChange} className='select-custom'>
              <option value="admin">Admin</option>
              <option value="graphics">Graphics</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <p style={{ fontSize: '20px' }}>
            โปรเจกต์ที่รับผิดชอบโดยทีม: {team}
          </p>
          {projects.length === 0 ? (
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
                  {currentProjects.map((project) => (
                    <tr
                      key={project.project_id}
                      className={
                        project.status === 'เสร็จสิ้น'
                          ? 'row-complete'
                          : project.status === 'กำลังดำเนินการ'
                          ? 'row-in-progress'
                          : 'row-default'
                      }
                      onClick={() => handleRowClick(project.project_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{project.project_id}</td>
                      <td>{project.project_name}</td>
                      <td>{project.customer_name}</td>
                      <td>{Number(project.price).toLocaleString()}</td>
                      <td>{project.responsible_team}</td>
                      <td>{project.status}</td>
                      <td>{project.due_date ? new Date(project.due_date).toLocaleDateString('th-TH') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
                <span>หน้า {currentPage} / {Math.ceil(projects.length / rowsPerPage)}</span>
                <button onClick={nextPage} disabled={currentPage === Math.ceil(projects.length / rowsPerPage)} className='BBB'>ถัดไป</button>
              </div>
            </>
          )}

          {/* Modal แสดงงานย่อย */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setShowModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>รายการงานย่อยของโปรเจกต์ {selectedProjectId}</h3>
                <br />
                {works.length === 0 ? (
                  <p>ไม่พบงานย่อย</p>
                ) : (
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>รหัสงาน</th>
                        <th>ชื่องาน</th>
                        <th>ประเภทงาน</th>
                        <th>รายละเอียด</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>กำหนดส่ง</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {works.map((work) => (
                        <tr
                          key={work.work_id}
                          className={
                            work.status === 'เสร็จสิ้น'
                              ? 'row-complete'
                              : work.status === 'กำลังดำเนินการ'
                              ? 'row-in-progress'
                              : work.status === 'รอดำเนินการ'
                              ? 'row-pending'
                              : work.status === 'ยกเลิก'
                              ? 'row-cancelled'
                              : ''
                          }
                        >
                          <td>{work.work_id}</td>
                          <td>{work.works_name}</td>
                          <td>{work.work_type}</td>
                          <td>{work.description}</td>
                          <td
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEmployeeClick(work.assigned_to)
                            }}
                            style={{ cursor: 'pointer', color: 'black', textDecoration: 'underline' }}
                            title="คลิกดูข้อมูลพนักงาน"
                          >
                            {work.assigned_to}
                          </td>
                          <td>{new Date(work.due_date).toLocaleDateString('th-TH')}</td>
                          <td>{work.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Modal ข้อมูลพนักงาน */}
          {showEmployeeModal && employeeData && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setShowEmployeeModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>ข้อมูลพนักงานที่ผูกไว้</h3>
                <div style={{ marginTop: '10px' }}>
                  <p><strong>ชื่อ:</strong> {employeeData.full_name}</p>
                  <p><strong>แผนก:</strong> {employeeData.department}</p>
                  <p><strong>ตำแหน่ง:</strong> {employeeData.position}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default Admin
