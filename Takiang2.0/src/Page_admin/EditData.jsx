
import React, { useState } from 'react';
import axios from 'axios';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2';
import Select from 'react-select';

function EditData() {
  const [openModal, setOpenModal] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

const handleSearch = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`/api/${openModal}/${searchId}`);

    const data = res.data;

    if (data.due_date) {
      // วิธีปลอดภัย ไม่ให้วันที่ลดลง
      const dateObj = new Date(data.due_date);
      const dateOnly = dateObj.toISOString().split('T')[0];
      setFormData({ ...data, due_date: dateOnly });
    } else {
      setFormData(data);
    }

  } catch (err) {
    console.error(err);
    alert('ไม่พบข้อมูล');
  } finally {
    setLoading(false);
  }
};
const workTypeOptions = [
    { value: "แผ่นอะคริลิกตัดตรงหรือเลเซอร์", label: "แผ่นอะคริลิกตัดตรงหรือเลเซอร์" },
    { value: "ฟิล์มโปร่งแสง ", label: "ฟิล์มโปร่งแสง " },
    { value: "แผ่นพับประชาสัมพันธ์", label: "แผ่นพับประชาสัมพันธ์" },
    { value: "งานตัดพลาสวูด", label: "งานตัดพลาสวูด" },
    { value: "งานตัดอะคริลิก", label: "งานตัดอะคริลิก" },
    { value: "สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร", label: "สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร" },
    { value: "แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า", label: "แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า" },
    { value: "การ์ดเชิญงานแต่ง, งานบวช ฯลฯ", label: "การ์ดเชิญงานแต่ง, งานบวช ฯลฯ" },
    { value: "ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ", label: "ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ" },
    { value: "ยิงเลเซอร์แกะลายบนสแตนเลส", label: "ยิงเลเซอร์แกะลายบนสแตนเลส" },
    { value: "ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง", label: "ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง" },
    { value: "พิมพ์นามบัตร 1 หน้า / 2 หน้า", label: "พิมพ์นามบัตร 1 หน้า / 2 หน้า" },
    { value: "กระดาษพีพีกันน้ำ", label: "กระดาษพีพีกันน้ำ" },
    { value: "แผ่นพลาสวูดหนา", label: "แผ่นพลาสวูดหนา" },
    { value: "ตรายางหมึกในตัว หรือหมึกแยก", label: "ตรายางหมึกในตัว หรือหมึกแยก" },
    { value: "ป้ายสแตนเลสกัดกรด", label: "ป้ายสแตนเลสกัดกรด" },
    { value: "งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน", label: "งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน" },
    { value: "สติ๊กเกอร์ติดแผ่นอะคริลิก", label: "สติ๊กเกอร์ติดแผ่นอะคริลิก" },
    { value: "สติ๊กเกอร์ฝ้า ", label: "สติ๊กเกอร์ฝ้า " },
    { value: "สติ๊กเกอร์ซีทรู", label: "สติ๊กเกอร์ซีทรู" },
    { value: "ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด", label: "ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด" },
    { value: "สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด", label: "สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด" },
    { value: "สติ๊กเกอร์ติดแผ่นพลาสวูด", label: "สติ๊กเกอร์ติดแผ่นพลาสวูด" },
    { value: "สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม", label: "สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม" },
    { value: "ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง", label: "ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง" },
    { value: "ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด", label: "ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด" },
    { value: "การพิมพ์ระบบแห้งด้วยรังสียูวี", label: "การพิมพ์ระบบแห้งด้วยรังสียูวี" },
    { value: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่", label: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่" },
  ];

const handleSave = async () => {
  try {
    if (openModal && searchId) {
      console.log('PUT to:', `/api/${openModal}/${searchId}`, formData);
      await axios.put(`/api/${openModal}/${searchId}`, formData);
    } else if (openModal) {
      console.log('POST to:', `/api/${openModal}`, formData);
      await axios.post(`/api/${openModal}`, formData);
    }

    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      showConfirmButton: false,
      timer: 1500
    });

    setOpenModal(null);
    setFormData({});
    setSearchId('');
  } catch (err) {
    console.error('Save error:', err);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err.message || 'โปรดลองอีกครั้ง',
    });
  }
};


  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card form-card">
          <h3>แก้ไขข้อมูลต่างๆ</h3>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
            <button className='ED01' onClick={() => setOpenModal('projects')}>แก้ไขข้อมูลโปรเจกต์</button>
            <button className='ED01' onClick={() => setOpenModal('works')}>แก้ไขข้อมูลงานย่อย</button>
            <button className='ED03' onClick={() => setOpenModal('customers')}>แก้ไขข้อมูลลูกค้า</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {openModal === 'projects' && 'แก้ไขข้อมูลโปรเจกต์'}
              {openModal === 'works' && 'แก้ไขข้อมูลงานย่อย'}
              {openModal === 'customers' && 'แก้ไขข้อมูลลูกค้า'}
            </h2>

            {/* Search */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder={`กรอกรหัส${openModal}`}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button onClick={handleSearch} className='btSearch'>ค้นหา</button>
            </div>

            {loading && <p>กำลังโหลดข้อมูล...</p>}

            {/* Form */}
            {openModal === 'customers' && formData && (
              <>
              <label>ชื่อลูกค้า</label>
                <input
                  type="text"
                  placeholder="ชื่อลูกค้า"
                  value={formData.customer_name || ''}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              <label>เลขประจำตัวผู้เสียภาษี</label>
                <input
                  type="text"
                  placeholder="เลขประจำตัวผู้เสียภาษี"
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                />
              <label>ที่อยู่ออกใบกำกับภาษี</label>
                <input
                  type="text"
                  placeholder="ที่อยู่ออกใบกำกับภาษี"
                  value={formData.billing_address || ''}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                />
              <label>อีเมล</label>
                <input
                  type="text"
                  placeholder="อีเมล"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <label>เพศ</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">เลือกเพศ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                <label>เบอร์โทร</label>
                <input
                  type="text"
                  placeholder="เบอร์โทร"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <label>ช่องทางติดต่ออื่น</label>
                <input
                  type="text"
                  placeholder="ช่องทางติดต่ออื่น"
                  value={formData.other_contact || ''}
                  onChange={(e) => setFormData({ ...formData, other_contact: e.target.value })}
                />
              </>
            )}

            {openModal === 'projects' && formData && (
              <>
              <label>ชื่อโปรเจค</label>
                <input
                  type="text"
                  placeholder="ชื่อโปรโปรเจกต์"
                  value={formData.project_name || ''}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                />
                <label>ราคา</label>
                <input
                  type="text"
                  placeholder="ราคา"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                <label>ทีมที่รับผิดชอบ</label>
                <input
                  type="text"
                  placeholder="ทีมที่รับผิดชอบ"
                  value={formData.responsible_team || ''}
                  onChange={(e) => setFormData({ ...formData, responsible_team: e.target.value })}
                />
                <label>วันครบกำหนด</label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
                <label>สถานะ</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                </select>
              </>
            )}

            {openModal === 'works' && formData && (
              <>
              <label>ชื่องานย่อย</label>
                <input
                  type="text"
                  placeholder="ชื่องานย่อย"
                  value={formData.works_name || ''}
                  onChange={(e) => setFormData({ ...formData, works_name: e.target.value })}
                />
               <div className="form-group">
      <label>ประเภทงาน</label>
      <Select
        options={workTypeOptions}
        value={workTypeOptions.find(opt => opt.value === formData.work_type) || null}
        onChange={(selected) =>
          setFormData(prev => ({ ...prev, work_type: selected?.value || '' }))
        }
        placeholder="-- เลือกประเภทงาน --"
        isSearchable
        maxMenuHeight={150}
      />
    </div>

               <label>ราคา</label>
              <input
                  type="text"
                  placeholder="ราคา"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />

                <label>รายละเอียด</label>
                <textarea
                  placeholder="รายละเอียด"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <label>ผู้รับผิดชอบ</label>
                <input
                  type="text"
                  placeholder="ผู้รับผิดชอบ"
                  value={formData.assigned_to || ''}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                />
                <label>วันครบกำหนด</label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
                <label>สถานะ</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              </>
            )}

            <div className="modal-buttons">
              <button onClick={handleSave}>บันทึก</button>
              <button onClick={() => setOpenModal(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditData;
