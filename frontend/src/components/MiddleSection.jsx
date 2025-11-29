import React, { useState } from 'react'
import { Brain, LineChart, Users, BookOpen } from 'lucide-react'

const MiddleSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const features = [
    {
      icon: <Brain size={40} />,
      title: "Adaptive Learning",
      description: "AI adjusts difficulty based on individual performance in real-time.",
      color: "#8b7cf6",
      gradient: "from-purple-500/20 to-purple-600/20"
    },
    {
      icon: <LineChart size={40} />,
      title: "Student Analytics",
      description: "Track progress, strengths, weaknesses, and growth with detailed insights.",
      color: "#3b82f6",
      gradient: "from-blue-500/20 to-blue-600/20"
    },
    {
      icon: <Users size={40} />,
      title: "NGO Dashboard",
      description: "Manage batches, monitor students, and view comprehensive reports.",
      color: "#10b981",
      gradient: "from-green-500/20 to-green-600/20"
    },
    {
      icon: <BookOpen size={40} />,
      title: "Smart Content",
      description: "AI-generated quizzes, lessons & personalized study plans for each student.",
      color: "#f59e0b",
      gradient: "from-orange-500/20 to-orange-600/20"
    }
  ]

  return (
    <div className="py-24 px-4 sm:px-6 bg-[#0f0f1e] w-full">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            What makes us different?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Purpose-built for NGO students with features that actually matter
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group relative p-8 bg-[#1a1a2e] rounded-2xl border-2 border-gray-800 hover:border-[#8b7cf6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#8b7cf6]/20 cursor-pointer ${
                hoveredIndex === idx ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Gradient Background Effect */}
              <div 
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              
              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    backgroundColor: `${feature.color}20`,
                    color: feature.color 
                  }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#8b7cf6] transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>

              {/* Hover Border Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `0 0 30px ${feature.color}40`
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Want to see how it works?
          </p>
          <button className="px-8 py-4 bg-[#8b7cf6] text-white rounded-xl hover:bg-[#7c6ce6] transition-all hover:shadow-lg hover:shadow-[#8b7cf6]/50 hover:scale-105 font-medium inline-flex items-center gap-2">
            Explore Features
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}

export default MiddleSection