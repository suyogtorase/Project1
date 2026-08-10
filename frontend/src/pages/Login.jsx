import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, MessageCircle, GraduationCap, BookOpen, Building } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Teacher')
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
    <div className='flex items-center justify-center min-h-screen px-6 bg-gray-50 relative overflow-hidden'>
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96  rounded-full filter  " />
        <div className="absolute bottom-20 right-1/4 w-96 h-96  rounded-full filter  " style={{ animationDelay: '1s' }} />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Login Card */}
      <div className='relative bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-2xl w-full sm:w-[420px] '>
        
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-8 w-8 text-gray-900lue-600" />
            <span className="text-2xl font-bold text-gray-900">EduFlex</span>
          </div>
          <h2 className='text-xl font-bold text-gray-900 mb-1'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-gray-500 text-xs'>
            {state === 'Sign Up' ? 'Start your learning journey today' : 'Continue your learning journey'}
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-3">

          {/* Name Field - Sign Up Only */}
          {state === 'Sign Up' && (
            <div className='relative group'>
              <div className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-gray-100 border-2 border-gray-300 focus-within:border-gray-900 transition-all'>
                <User className="h-4 w-4 text-gray-500" />
                <input
                  onChange={e => setName(e.target.value)}
                  value={name}
                  className='bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 text-sm'
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
              <label className='text-xs font-medium text-gray-700'>I am a:</label>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                    role === 'Student'
                      ? 'bg-gray-100 border-gray-900 text-gray-900'
                      : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium text-[10px] sm:text-xs truncate w-full text-gray-900enter">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Teacher')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                    role === 'Teacher'
                      ? 'bg-gray-100 border-gray-900 text-gray-900'
                      : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium text-[10px] sm:text-xs truncate w-full text-gray-900enter">Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Administrator')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                    role === 'Administrator'
                      ? 'bg-gray-100 border-gray-900 text-gray-900'
                      : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  <Building className="h-5 w-5" />
                  <span className="font-medium text-[10px] sm:text-xs truncate w-full text-gray-900enter">Admin</span>
                </button>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className='relative group'>
            <div className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-gray-100 border-2 border-gray-300 focus-within:border-gray-900 transition-all'>
              <Mail className="h-4 w-4 text-gray-500" />
              <input
                onChange={e => setEmail(e.target.value)}
                value={email}
                className='bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 text-sm'
                type="email"
                placeholder="Email address"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className='relative group'>
            <div className='flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-gray-100 border-2 border-gray-300 focus-within:border-gray-900 transition-all'>
              <Lock className="h-4 w-4 text-gray-500" />
              <input
                onChange={e => setPassword(e.target.value)}
                value={password}
                className='bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 text-sm'
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
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
                className='text-xs text-gray-900lue-600 hover:text-gray-900lue-600 transition-colors'
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className='w-full py-2.5 rounded-lg bg-gray-900 text-white font-semibold hover:shadow-lg hover:shadow-md transition-all hover:scale-[1.02] mt-4 text-sm'
          >
            {state === 'Sign Up' ? 'Create Account' : 'Sign In'}
          </button>

          {/* Toggle State */}
          <div className='text-gray-900enter'>
            {state === 'Sign Up' ? (
              <p className='text-gray-500 text-xs'>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setState('Login')}
                  className='text-gray-900lue-600 hover:text-gray-900lue-600 font-medium transition-colors'
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className='text-gray-500 text-xs'>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setState('Sign Up')}
                  className='text-gray-900lue-600 hover:text-gray-900lue-600 font-medium transition-colors'
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-500 text-xs">OR</span>
          <hr className="flex-grow border-gray-300" />
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
          <p className='text-xs text-gray-500 text-gray-900enter mt-4'>
            By creating an account, you agree to our{' '}
            <a href="#" className='text-gray-900lue-600 hover:underline'>Terms</a>
            {' '}and{' '}
            <a href="#" className='text-gray-900lue-600 hover:underline'>Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login