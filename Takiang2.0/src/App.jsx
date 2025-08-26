// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RequireAuth from './Component/RequireAuth'

import Login from './Page/Login'
import Index_user from './Page/Index_user'
import MyWork_user from './Page/Mywork_user'
import SubmitWork from './Page/SubmitWork'
import Status_work from './Page/Status_work'
import Completed_work from './Page/Completed_work'
import Profile from './Page/Profile'

import Admin from './Page_admin/Admin'
import MyWork_A from './Page_admin/Mywork_A'
import Completed_work_A from './Page_admin/Completed_work_A'
import Profile_A from './Page_admin/Profile_A'
import Status_work_A from './Page_admin/Status_work_A'
import SubmitWork_A from './Page_admin/SubmitWork_A'
import AddCustomer from './Page_admin/AddCustomer'
import Add_user from './Page_admin/Add_user'
import CheckWork from './Page_admin/CheckWork'
import AddProject from './Page_admin/AddProject'
import AddJob from './Page_admin/AddJob'
import EditData from './Page_admin/EditData'
import Consider from './Page_Consider/Consider'
import Profile_C from './Page_Consider/Profile_C'
import ReviewWorks from './Page_Consider/ReviewWorks'
function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Login ไม่ต้องล็อกอิน */}
        <Route path="/" element={<Login />} />

        {/* User Pages (ล็อกอินก่อน) */}
        <Route path="/index_user" element={
          <RequireAuth><Index_user /></RequireAuth>
        } />
        <Route path="/Mywork_user" element={
          <RequireAuth><MyWork_user /></RequireAuth>
        } />
        <Route path="/SubmitWork" element={
          <RequireAuth><SubmitWork /></RequireAuth>
        } />
        <Route path="/Status_work" element={
          <RequireAuth><Status_work /></RequireAuth>
        } />
        <Route path="/Completed_work" element={
          <RequireAuth><Completed_work /></RequireAuth>
        } />
        <Route path="/Profile" element={
          <RequireAuth><Profile /></RequireAuth>
        } />

        {/* Admin Pages (ล็อกอินก่อน) */}
        <Route path="/Admin" element={
          <RequireAuth><Admin /></RequireAuth>
        } />
        <Route path="/MyWork_A" element={
          <RequireAuth><MyWork_A /></RequireAuth>
        } />
        <Route path="/Completed_work_A" element={
          <RequireAuth><Completed_work_A /></RequireAuth>
        } />
        <Route path="/Profile_A" element={
          <RequireAuth><Profile_A /></RequireAuth>
        } />
        <Route path="/Status_work_A" element={
          <RequireAuth><Status_work_A /></RequireAuth>
        } />
        <Route path="/SubmitWork_A" element={
          <RequireAuth><SubmitWork_A /></RequireAuth>
        } />
        <Route path="/AddCustomer" element={
          <RequireAuth><AddCustomer /></RequireAuth>
        } />
        <Route path="/Add_user" element={
          <RequireAuth><Add_user /></RequireAuth>
        } />
        <Route path="/CheckWork" element={
          <RequireAuth><CheckWork /></RequireAuth>
        } />
        <Route path="/AddProject" element={
          <RequireAuth><AddProject /></RequireAuth>
        } />
        <Route path="/AddJob" element={
          <RequireAuth><AddJob /></RequireAuth>
        } />
        <Route path="/EditData" element={
          <RequireAuth><EditData /></RequireAuth>
        } />
        <Route path="/Consider" element={
          <RequireAuth><Consider /></RequireAuth>
        } />
        <Route path="/Profile_C" element={
          <RequireAuth><Profile_C /></RequireAuth>
        } />
        <Route path="/ReviewWorks" element={
          <RequireAuth><ReviewWorks /></RequireAuth>
        } />
      </Routes>
    </Router>
  )
}

export default App
