import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar_admin'
import '../Css/Table.css';
import Swal from 'sweetalert2';

function SubmitWork() {
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [link, setLink] = useState('');
  const [roundNumber, setRoundNumber] = useState(1);

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;

    axios.get(`http://localhost:3001/api/works/inprogress/${username}`)
      .then(async (res) => {
        const worksWithRound = await Promise.all(
          res.data.map(async (work) => {
            try {
              const roundRes = await axios.get(
                `http://localhost:3001/api/submit-work/latest-round/${username}/${work.project_id}/${work.works_id}`
              );
              return { ...work, latestRound: roundRes.data.latestRound || 0 };
            } catch {
              return { ...work, latestRound: 0 };
            }
          })
        );
        setWorks(worksWithRound);
      })
      .catch(err => console.error('Error fetching works:', err));
  }, [username]);

  const handleWorkChange = (e) => {
    const work = works.find(w => w.works_id === e.target.value);
    setSelectedWork(work);
    if (work) {
      setRoundNumber(work.latestRound + 1);
    } else {
      setRoundNumber(1);
    }
    setLink('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWork) {
      return Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกงาน',
      });
    }
    if (!link) {
      return Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกลิงก์งาน',
      });
    }
    if (selectedWork.latestRound >= 10) {
      return Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถส่งงานเกิน 10 รอบได้',
      });
    }

    try {
      await axios.post('http://localhost:3001/api/submit-work', {
        username: username,
        project_id: selectedWork.project_id,
        works_id: selectedWork.works_id,
        round_number: roundNumber,
        link,
      });

      await Swal.fire({
        icon: 'success',
        title: `ส่งงานรอบที่ ${roundNumber} เรียบร้อยแล้ว`,
        timer: 1500,
        showConfirmButton: false,
      });

      // รีเฟรชข้อมูลรอบล่าสุด
      const updatedWorks = await Promise.all(
        works.map(async (work) => {
          if (work.works_id === selectedWork.works_id) {
            try {
              const roundRes = await axios.get(
                `http://localhost:3001/api/submit-work/latest-round/${username}/${work.project_id}/${work.works_id}`
              );
              return { ...work, latestRound: roundRes.data.latestRound || roundNumber };
            } catch {
              return { ...work, latestRound: roundNumber };
            }
          }
          return work;
        })
      );

      setWorks(updatedWorks);
      setSelectedWork(null);
      setLink('');
      setRoundNumber(1);
    } catch (error) {
      console.error('Error submitting work:', error);
      if (error.response && error.response.data && error.response.data.message) {
        Swal.fire({
          icon: 'error',
          title: 'ส่งงานไม่สำเร็จ',
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ส่งงานไม่สำเร็จ',
          text: 'กรุณาลองใหม่',
        });
      }
    }
  };

  return (
    <div>
      <div className="content-wrapper">
      <Navbar />
      
        <h2 className="submit-work-title">ส่งงาน</h2>
        <form onSubmit={handleSubmit}>
          <label className="submit-work-label">งานที่รับผิดชอบ:</label>
          <select
            className="submit-work-select"
            value={selectedWork ? selectedWork.works_id : ''}
            onChange={handleWorkChange}
          >
            <option value="">-- เลือกงาน --</option>
            {works.map(work => (
              <option key={work.works_id} value={work.works_id}>
                {work.project_name} - {work.works_name}
              </option>
            ))}
          </select>

          {selectedWork && selectedWork.latestRound >= 10 && (
            <p style={{ color: 'red' }}>ไม่สามารถส่งงานนี้ได้อีก (ครบ 10 รอบ)</p>
          )}

          <label className="submit-work-label">รอบที่ส่ง:</label>
          <input
            className="submit-work-input"
            type="number"
            min="1"
            value={roundNumber}
            readOnly
          />

          <label className="submit-work-label">ลิงก์งาน:</label>
          <input
            className="submit-work-input"
            type="url"
            placeholder="วางลิงก์งานที่นี่"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            disabled={selectedWork && selectedWork.latestRound >= 10}
          />

          <button
            type="submit"
            className="submit-work-button"
            disabled={selectedWork && selectedWork.latestRound >= 10}
          >
            ส่งงาน
          </button>
        </form>
      </div>
    </div>
    
  );
}

export default SubmitWork;
