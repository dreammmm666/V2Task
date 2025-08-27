import React, { useEffect, useState } from 'react';
import Navbar from '../Component/Navbar_C_2'
import '../Css/Table.css';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;
    axios.get(`/api/profile/${username}`)
      .then(res => setProfile(res.data))
      .catch(err => console.error('Error fetching profile:', err));
  }, [username]);

  if (!profile) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
       
         
  <div className="card profile-card">
    <h3>ข้อมูลส่วนตัวพนักงาน</h3>

    <div className="profile-info">
      {/* แสดงรูปภาพ */}
      <img
        src={profile.profile_image}
        alt="รูปพนักงาน"
        className="profile-image"
      />

      {/* แสดงข้อมูล */}
      <div className="profile-details">
        <p><strong>รหัสพนักงาน</strong> {profile.employee_id}</p>
        <p><strong>ชื่อ-สกุล:</strong> {profile.full_name}</p>
        <p><strong>เพศ:</strong> {profile.gender}</p>
        <p><strong>อายุ:</strong> {profile.age} ปี</p>
        <p><strong>ตำแหน่ง:</strong> {profile.position}</p>
        <p><strong>แผนก:</strong> {profile.department}</p>
        <p><strong>เงินเดือน:</strong> {Number(profile.current_salary).toLocaleString()} บาท</p>
      </div>
    </div>
  </div>
</div>
        
      
    </>
  );
}

export default Profile;
