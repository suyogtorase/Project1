import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify';
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashBoard'
import ChatHome from './pages/ChatHome'
import ProfilePage from './pages/ProfilePage'

const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/chat' element={<ChatHome/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<ProfilePage/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
      </Routes>
    </div>
  )
}

export default App
