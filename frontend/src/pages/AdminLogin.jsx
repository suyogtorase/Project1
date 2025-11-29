import React, { useState, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();

  const { 
    backendUrl, 
    setIsAdminLoggedIn, 
    getAdminData 
  } = useContext(AppContent);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        backendUrl + '/api/auth/admin-login',
        { email, password }
      );

      if (data.success) {
        setIsAdminLoggedIn(true);
        getAdminData();

        navigate('/admin/dashboard');
      } 
      else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt=""
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          Admin Login
        </h2>

        <p className='text-center text-sm mb-6'>
          Login to access the admin panel
        </p>

        <form onSubmit={onSubmitHandler}>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none'
              type="email"
              placeholder="Admin Email"
              required
            />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none'
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <p
            onClick={() => navigate('/admin/reset-password')}
            className='mb-4 text-indigo-500 cursor-pointer'>
            Forgot Password?
          </p>

          <button
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
