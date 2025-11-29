// import React, { useContext, useState } from 'react'
// import { assets } from '../assets/assets'
// import { useNavigate } from 'react-router-dom'
// import { AppContent } from '../context/AppContext'
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import { GoogleLogin } from '@react-oauth/google'

// const Login = () => {

//   const navigate = useNavigate()

//   const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent)

//   const [state, setState] = useState('Sign Up')
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [role, setRole] = useState('Student')   // NEW ROLE FIELD

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     try {
//       axios.defaults.withCredentials = true;

//       if (state === 'Sign Up') {
//         const { data } = await axios.post(backendUrl + '/api/auth/register',
//           { name, email, password, role }      // SEND ROLE
//         );

//         if (data.success) {
//           setIsLoggedIn(true);
//           getUserData()
//           navigate('/');
//         } else {
//           toast.error(data.message);
//         }
//       } else {
//         const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password });

//         if (data.success) {
//           setIsLoggedIn(true);
//           getUserData()
//           navigate('/');
//         } else {
//           toast.error(data.message);
//         }
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong");
//     }
//   };

//   // Google login with role sending
//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       axios.defaults.withCredentials = true;

//       const { data } = await axios.post(
//         backendUrl + '/api/auth/google',
//         { credential: credentialResponse.credential, role }  // SEND ROLE
//       );

//       if (data.success) {
//         setIsLoggedIn(true);
//         getUserData();
//         navigate('/');
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Google login failed");
//     }
//   };

//   return (
//     <div className='flex items-center mt-15 justify-center min-h-screen px-6 sm:px-0'>
//       <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
//       <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>

//         <h2
//           className='text-3xl font-semibold text-white text-center mb-3'>
//           {state === 'Sign Up' ? 'Create Account' : 'Login'}
//         </h2>

//         <p
//           className='text-center text-sm mb-6'>
//           {state === 'Sign Up' ? 'Create your account' : 'Login to your account'}
//         </p>

//         <form onSubmit={onSubmitHandler}>

//           {state === 'Sign Up' && (
//             <>
//               {/* FULL NAME */}
//               <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
//                 <img src={assets.person_icon} alt="" />
//                 <input
//                   onChange={e => setName(e.target.value)}
//                   value={name}
//                   className='bg-transparent outline-none' type="text" placeholder="Full Name" required />
//               </div>

//               {/* ROLE DROPDOWN */}
//               <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
//                 <img src={assets.person_icon} alt="" />

//                 <select
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   className='bg-transparent outline-none w-full text-indigo-300'
//                 >
//                   <option value="Student" className='text-black'>Student</option>
//                   <option value="Teacher" className='text-black'>Teacher</option>
//                 </select>
//               </div>
//             </>
//           )}

//           {/* EMAIL */}
//           <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
//             <img src={assets.mail_icon} alt="" />
//             <input
//               onChange={e => setEmail(e.target.value)}
//               value={email}
//               className='bg-transparent outline-none' type="email" placeholder="Email id" required />
//           </div>

//           {/* PASSWORD */}
//           <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
//             <img src={assets.lock_icon} alt="" />
//             <input
//               onChange={e => setPassword(e.target.value)}
//               value={password}
//               className='bg-transparent outline-none' type="password" placeholder="Password" required />
//           </div>

//           <p
//             onClick={() => navigate('/reset-password')}
//             className='mb-4 text-indigo-500 cursor-pointer'>
//             Forgot Password?
//           </p>

//           <button
//             className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
//             {state}
//           </button>

//           {state === 'Sign Up' ? (
//             <p className='text-gray-400 text-center text-xs mt-4'>Already have an account?{' '}
//               <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Login Here</span>
//             </p>
//           ) : (
//             <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account?{' '}
//               <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign up</span>
//             </p>
//           )}
//         </form>

//         {/* Divider */}
//         <div className="flex items-center my-4">
//           <hr className="flex-grow border-gray-600" />
//           <span className="px-2 text-gray-400">OR</span>
//           <hr className="flex-grow border-gray-600" />
//         </div>

//         {/* Google Login */}
//         <div className="flex justify-center">
//           <GoogleLogin
//             onSuccess={handleGoogleSuccess}
//             onError={() => toast.error("Google Login Failed")}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Login

import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, MessageCircle, GraduationCap, BookOpen } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Student')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;

      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/auth/register',
          { name, email, password, role }
        );

        if (data.success) {
          setIsLoggedIn(true);
          getUserData()
          navigate('/');
          toast.success('Account created successfully!');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password });

        if (data.success) {
          setIsLoggedIn(true);
          getUserData()
          navigate('/');
          toast.success('Welcome back!');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        backendUrl + '/api/auth/google',
        { credential: credentialResponse.credential, role }
      );

      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
        navigate('/');
        toast.success('Logged in with Google!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 bg-[#0f0f1e] relative overflow-hidden'>
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8b7cf6]/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Login Card */}
      <div className='relative bg-[#1a1a2e] border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full sm:w-[420px] backdrop-blur-xl'>
        
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-8 w-8 text-[#8b7cf6]" />
            <span className="text-2xl font-bold text-white">EduFlex</span>
          </div>
          <h2 className='text-xl font-bold text-white mb-1'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-gray-400 text-xs'>
            {state === 'Sign Up' ? 'Start your learning journey today' : 'Continue your learning journey'}
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-3">

          {/* Name Field - Sign Up Only */}
          {state === 'Sign Up' && (
            <div className='relative group'>
              <div className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#2a2a3e] border-2 border-gray-700 focus-within:border-[#8b7cf6] transition-all'>
                <User className="h-4 w-4 text-gray-400" />
                <input
                  onChange={e => setName(e.target.value)}
                  value={name}
                  className='bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm'
                  type="text"
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>
          )}

          {/* Role Selector - Sign Up Only */}
          {state === 'Sign Up' && (
            <div className='space-y-2'>
              <label className='text-xs font-medium text-gray-300'>I am a:</label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    role === 'Student'
                      ? 'bg-[#8b7cf6]/10 border-[#8b7cf6] text-white'
                      : 'bg-[#2a2a3e] border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium text-sm">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Teacher')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    role === 'Teacher'
                      ? 'bg-[#8b7cf6]/10 border-[#8b7cf6] text-white'
                      : 'bg-[#2a2a3e] border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium text-sm">Teacher</span>
                </button>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className='relative group'>
            <div className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#2a2a3e] border-2 border-gray-700 focus-within:border-[#8b7cf6] transition-all'>
              <Mail className="h-4 w-4 text-gray-400" />
              <input
                onChange={e => setEmail(e.target.value)}
                value={email}
                className='bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm'
                type="email"
                placeholder="Email address"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className='relative group'>
            <div className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#2a2a3e] border-2 border-gray-700 focus-within:border-[#8b7cf6] transition-all'>
              <Lock className="h-4 w-4 text-gray-400" />
              <input
                onChange={e => setPassword(e.target.value)}
                value={password}
                className='bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm'
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password - Login Only */}
          {state === 'Login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className='text-xs text-[#8b7cf6] hover:text-[#7c6ce6] transition-colors'
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className='w-full py-2.5 rounded-lg bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] text-white font-semibold hover:shadow-lg hover:shadow-[#8b7cf6]/50 transition-all hover:scale-[1.02] mt-4 text-sm'
          >
            {state === 'Sign Up' ? 'Create Account' : 'Sign In'}
          </button>

          {/* Toggle State */}
          <div className='text-center'>
            {state === 'Sign Up' ? (
              <p className='text-gray-400 text-xs'>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setState('Login')}
                  className='text-[#8b7cf6] hover:text-[#7c6ce6] font-medium transition-colors'
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className='text-gray-400 text-xs'>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setState('Sign Up')}
                  className='text-[#8b7cf6] hover:text-[#7c6ce6] font-medium transition-colors'
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-3 text-gray-500 text-xs">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login Failed")}
              size="large"
              width="100%"
              theme="filled_black"
            />
          </div>
        </div>

        {/* Terms Text - Sign Up Only */}
        {state === 'Sign Up' && (
          <p className='text-xs text-gray-500 text-center mt-4'>
            By creating an account, you agree to our{' '}
            <a href="#" className='text-[#8b7cf6] hover:underline'>Terms</a>
            {' '}and{' '}
            <a href="#" className='text-[#8b7cf6] hover:underline'>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login