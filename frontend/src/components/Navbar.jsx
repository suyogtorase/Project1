// import React, { useContext } from 'react'
// import { assets } from '../assets/assets'
// import { useNavigate } from 'react-router-dom'
// import { AppContent } from '../context/AppContext'
// import axios from 'axios'
// import { toast } from 'react-toastify'

// const Navbar = () => {
//   const navigate = useNavigate()
//   const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContent)

//   const logout = async () => {
//     try {
//       const { data } = await axios.post(backendUrl + '/api/auth/logout', {
//         withCredentials: true,
//       })

//       if (data.success) {
//         setIsLoggedIn(false);
//         setUserData(false);
//         navigate('/')
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   const sendVerificationOtp = async() => {
//     try {
//       axios.defaults.withCredentials = true

//       const { data } = await axios.get(backendUrl + '/api/auth/send-verify-otp')

//       if(data.success){
//         navigate('/email-verify')
//         toast.success(data.message)
//       }
//       else{
//         toast.error(data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   return (
//     <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>

//       <img src={assets.logo} alt="" className='w-28 sm:w-32' />

//       {userData ?
//         <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group'>
//           {userData.name[0].toUpperCase()}
//           <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>

//             <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
//               {!userData.userVerified &&
//                 <li onClick={sendVerificationOtp} className='px-1 py-2 hover:bg-gray-200 cursor-pointer'>Verify Email</li>
//               }

//               <li onClick={logout} className='px-1 py-2 hover:bg-gray-200 cursor-pointer pr-10'>Logout</li>
//             </ul>

//           </div>
//         </div> :
//         <button
//           className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'
//           onClick={() => navigate('/login')}
//         >
//           Login
//           <img src={assets.arrow_icon} alt="" />
//         </button>
//       }



//     </div>
//   )
// }

// export default Navbar

import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  MessageCircle, 
  Menu, 
  X, 
  BookOpen, 
  User, 
  MessageSquare, 
  LayoutDashboard,
  LogOut,
  Mail,
  ChevronDown,
  Home,
  Trophy,
  Users
} from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContent)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/logout', {
        withCredentials: true,
      })

      if (data.success) {
        setIsLoggedIn(false)
        setUserData(false)
        navigate('/')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true

      const { data } = await axios.get(backendUrl + '/api/auth/send-verify-otp')

      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Classroom', path: '/classroom', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'Chat', path: '/chat', icon: <MessageSquare className="h-4 w-4" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy className="h-4 w-4" /> },
  ]

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl' : 'bg-[#1a1a2e]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <MessageCircle className="h-8 w-8 text-[#8b7cf6] transition-transform group-hover:rotate-12" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4ade80] rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold text-white hidden sm:block">
              EduFlex
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors relative group font-medium"
              >
                {link.icon}
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8b7cf6] transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* User Menu / Login */}
          <div className="flex items-center gap-4">
            {userData ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-[#2a2a3e] rounded-xl border border-gray-700 hover:border-[#8b7cf6] transition-all group"
                >
                  <div className="w-9 h-9 flex justify-center items-center rounded-full bg-gradient-to-br from-[#8b7cf6] to-[#6366f1] text-white font-bold">
                    {userData.name[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-white font-medium text-sm">{userData.name}</p>
                    {!userData.userVerified && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                        Not verified
                      </p>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1a1a2e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-white font-semibold">{userData.name}</p>
                      <p className="text-sm text-gray-400 truncate">{userData.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile')
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a3e] hover:text-white transition-colors"
                      >
                        <User className="h-5 w-5" />
                        My Profile
                      </button>

                      <button
                        onClick={() => {
                          navigate('/classroom')
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a3e] hover:text-white transition-colors"
                      >
                        <BookOpen className="h-5 w-5" />
                        My Classroom
                      </button>

                      <button
                        onClick={() => {
                          navigate('/dashboard')
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a3e] hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          navigate('/chat')
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-[#2a2a3e] hover:text-white transition-colors"
                      >
                        <MessageSquare className="h-5 w-5" />
                        AI Chat
                      </button>

                      {!userData.userVerified && (
                        <>
                          <div className="my-2 border-t border-gray-700"></div>
                          <button
                            onClick={() => {
                              sendVerificationOtp()
                              setIsUserMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-orange-400 hover:bg-[#2a2a3e] transition-colors"
                          >
                            <Mail className="h-5 w-5" />
                            Verify Email
                          </button>
                        </>
                      )}

                      <div className="my-2 border-t border-gray-700"></div>

                      <button
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-[#2a2a3e] transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="px-6 py-3 bg-[#8b7cf6] text-white rounded-xl hover:bg-[#7c6ce6] transition-all hover:shadow-lg hover:shadow-[#8b7cf6]/50 hover:scale-105 font-medium"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1a1a2e] border-t border-gray-800 animate-in slide-in-from-top">
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(link.path)
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 py-3 text-gray-300 hover:text-white transition-colors"
                >
                  {link.icon}
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top 0.2s ease-out;
        }
      `}</style>
    </nav>
  )
}

export default Navbar
