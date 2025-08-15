import React, { useEffect } from 'react';
import feather from 'feather-icons';
import '../Css/Navbar.css'

function Navbar() {
  useEffect(() => {
    feather.replace(); 
  }, []);
  const handleLogout = () => {
  localStorage.clear();
  window.location.replace('/');
}
  return (
    <nav className="navbar">
      <ul className="navbar__menu">
        <li className="navbar__item">
          <a href="/index_user" className="navbar__link">
            <i data-feather="calendar"></i>
            <span>ตารางงานของทีม</span>
          </a>
        </li>
        <li className="navbar__item">
          <a href="/Mywork_user" className="navbar__link">
            <i data-feather="briefcase"></i>
            <span>งานของฉัน</span>
          </a>
        </li>
        <li className="navbar__item">
          <a href="/SubmitWork" className="navbar__link">
            <i data-feather="upload-cloud"></i>
            <span>ส่งงานตรวจสอบ</span>
          </a>
        </li>
        <li className="navbar__item">
          <a href="/Status_work" className="navbar__link">
            <i data-feather="check-circle"></i>
            <span>สถานะของงานที่ส่งตรวจ</span>
          </a>
          
        </li>
        <li className="navbar__item">
          <a href="/Completed_work" className="navbar__link">
            <i data-feather="check-square"></i>
            <span>จํานวนงานที่เรียบร้อย</span>
          </a>
        </li>
        <li className="navbar__item">
          <a href="/Profile" className="navbar__link">
            <i data-feather="user"></i>
            <span>ข้อมูลส่วนตัว</span>
          </a>
        </li>
        
        
        
     
     <li className="navbar__item logout" onClick={handleLogout}>
  <a href="#" className="navbar__link">
    <i data-feather="log-out"></i>
    <span>ออกจากระบบ</span>
  </a>
</li>
   
      </ul>
    </nav>
  );
}

export default Navbar;
