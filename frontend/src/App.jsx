import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashBoard'
import ChatHome from './pages/ChatHome'
import Groups from './pages/Groups'
import ProfilePage from './pages/ProfilePage'
import Classroom from './pages/Classroom'
import ClassroomDetails from './pages/ClassroomDetails'
import TestBuilder from './pages/TestBuilder'
import TestTaker from './pages/TestTaker'
import TestResults from './pages/TestResults'
import Announcements from './pages/Announcements'
import OfflineMarksEntry from './pages/OfflineMarksEntry'

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/groups' element={<Groups />} />
        <Route path='/announcements' element={<Announcements />} />
        <Route path='/login' element={<Login />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/classroom' element={<Classroom />} />
        <Route path='/classroom/:id' element={<ClassroomDetails />} />
        <Route path='/classroom/:id/tests/create' element={<TestBuilder />} />
        <Route path='/classroom/:id/tests/:testId/take' element={<TestTaker />} />
        <Route path='/classroom/:id/tests/:testId/results' element={<TestResults />} />
        <Route path='/classroom/:id/tests/:testId/offline-marks' element={<OfflineMarksEntry />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

export default App
