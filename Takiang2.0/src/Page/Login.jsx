import React, { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import '../Css/Login.css'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบ',
        confirmButtonText: 'ตกลง',
      })
      return
    }

    try {
      const res = await axios.post('http://localhost:3001/api/login', formData)
      const { message, team, user_id, username } = res.data  // <-- เพิ่ม username

      // บันทึก team, user_id, username ลง localStorage
      localStorage.setItem('team', team)
      localStorage.setItem('user_id', user_id)
      localStorage.setItem('username', username)

      Swal.fire({
        icon: 'success',
        title: message || 'เข้าสู่ระบบสำเร็จ',
        confirmButtonText: 'ตกลง',
      }).then(() => {
        if (team === 'graphics' || team === 'marketing') {
          navigate('/index_user')
        } else if (team === 'admin') {
          navigate('/Admin')
        } else {
          navigate('/')
        }
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: err.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonText: 'ลองอีกครั้ง',
      })
    }
  }

  return (
    <div>
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit} className='form1'>
        <h3>Login</h3>

        <label htmlFor="username" className='label1'>Username</label>
        <input className='input1'
          type="text"
          placeholder="Username"
          id="username"
          autoComplete="off"
          value={formData.username}
          onChange={handleChange}
        />

        <label htmlFor="password" className='label1'>Password</label>
        <input className='input1'
          type="password"
          placeholder="Password"
          id="password"
          autoComplete="off"
          value={formData.password}
          onChange={handleChange}
        />
    
        <button type="submit" className='button1'>Log In</button>
      </form>
    </div>
  )
}

export default Login
