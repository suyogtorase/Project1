// import React, { useContext } from 'react'
// import { assets } from '../assets/assets'
// import { AppContent } from '../context/AppContext'

// const Header = () => {

//     const {userData} = useContext(AppContent)

//     return (
//         <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
//             <img src={assets.robo_gif} alt=""
//                 className='w-72 h-72 rounded-full mb-6' />

//             <h1
//                 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>
//                 Hey {userData ? userData.name : 'Developer'}!
//                 <img className='w-8 aspect-square' src={assets.hand_wave} alt="" />
//             </h1>

//             <h2
//                 className='text-3xl sm:text-5xl font-semibold mb-4'>
//                 Welcome to My Website
//             </h2>

//             <p
//                 className='mb-8 max-w-md'>
//                 Let's start with a quick product tour and we will have you up and running in no time!
//             </p>

//             <button
//                 className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'>
//                 Get Started
//             </button>
//         </div>
//     )
// }

// export default Header

import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react'

const Header = () => {
  const { userData } = useContext(AppContent)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className='relative overflow-hidden bg-[#0f0f1e] pt-32 pb-20 w-full'>
      
      {/* Animated Background Gradients */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-20 left-1/4 w-96 h-96 bg-[#8b7cf6]/20 rounded-full filter blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full filter blur-3xl animate-pulse"
          style={{
            animation: 'pulse 3s ease-in-out infinite',
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`
          }}
        />
      </div>

      <div className='relative flex flex-col items-center px-4 sm:px-6 text-center w-full max-w-7xl mx-auto'>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8b7cf6]/10 backdrop-blur-sm rounded-full border border-[#8b7cf6]/20 text-[#8b7cf6] text-sm font-medium mb-8 animate-in slide-in-from-top">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b7cf6] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8b7cf6]"></span>
          </span>
          AI-Powered Learning Platform
        </div>

        {/* Robot Image with Glow Effect */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-[#8b7cf6]/30 rounded-full blur-2xl group-hover:bg-[#8b7cf6]/40 transition-all duration-300" />
          <img 
            src={assets.robo_gif} 
            alt="AI Mentor"
            className='relative w-72 h-72 rounded-full shadow-2xl border-4 border-[#8b7cf6]/20 group-hover:scale-105 transition-transform duration-300' 
          />
          {/* Floating Icons */}
          <div className="absolute -top-4 -right-4 bg-[#2a2a3e] border border-[#8b7cf6]/30 text-white p-3 rounded-xl shadow-xl animate-bounce">
            <Sparkles className="h-5 w-5 text-[#8b7cf6]" />
          </div>
        </div>

        {/* Greeting */}
        <h1 className='flex items-center gap-3 text-2xl sm:text-4xl font-bold mb-4 text-white animate-in slide-in-from-bottom animation-delay-200'>
          Hello {userData ? userData.name : 'Learner'}!
          <img className='w-10 aspect-square animate-wave' src={assets.hand_wave} alt="" />
        </h1>

        {/* Main Heading */}
        <h2 className='text-4xl sm:text-6xl font-bold mb-6 max-w-4xl text-white leading-tight animate-in slide-in-from-bottom animation-delay-400'>
          AI-Powered{' '}
          <span className='relative inline-block'>
            <span className='relative z-10 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] bg-clip-text text-transparent'>
              Adaptive Learning
            </span>
            <span className='absolute bottom-2 left-0 w-full h-3 bg-[#8b7cf6]/30 -rotate-1' />
          </span>
          {' '}for NGO Students
        </h2>

        {/* Description */}
        <p className='mb-10 max-w-2xl text-xl text-gray-300 leading-relaxed animate-in slide-in-from-bottom animation-delay-600'>
          Personalized lessons that adapt to each student's performance, pace, and skill level. 
          Empowering every learner with quality education.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-in slide-in-from-bottom animation-delay-800">
          <button className='group px-8 py-4 bg-[#8b7cf6] text-white rounded-xl hover:bg-[#7c6ce6] transition-all hover:shadow-xl hover:shadow-[#8b7cf6]/50 hover:scale-105 flex items-center justify-center gap-2 font-medium'>
            Start Learning Now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className='px-8 py-4 bg-[#2a2a3e] text-white rounded-xl border-2 border-gray-700 hover:border-[#8b7cf6] hover:text-[#8b7cf6] transition-all font-medium'>
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 animate-in slide-in-from-bottom animation-delay-1000">
          <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1a2e] rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-[#8b7cf6]/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#8b7cf6]" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">10,000+</p>
              <p className="text-sm text-gray-400">Active Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1a2e] rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#10b981]" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">95%</p>
              <p className="text-sm text-gray-400">Success Rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1a2e] rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-[#f59e0b]" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-sm text-gray-400">NGO Partners</p>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animate-in {
          animation: slideIn 0.6s ease-out backwards;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default Header
