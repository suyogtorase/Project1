import React from 'react'
import { MessageCircle, Mail, Github, Linkedin, Twitter, Heart, ExternalLink } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-[#0f0f1e] text-gray-300 py-16 border-t border-gray-800 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-8 w-8 text-[#8b7cf6]" />
              <span className="text-2xl font-bold text-white">EduFlex</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Adaptive learning platform designed specifically for NGO students. Making quality education accessible to everyone.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center hover:bg-[#2a2a3e] hover:text-[#8b7cf6] transition-all cursor-pointer border border-gray-800 group">
                <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center hover:bg-[#2a2a3e] hover:text-[#8b7cf6] transition-all cursor-pointer border border-gray-800 group">
                <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center hover:bg-[#2a2a3e] hover:text-[#8b7cf6] transition-all cursor-pointer border border-gray-800 group">
                <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center hover:bg-[#2a2a3e] hover:text-[#8b7cf6] transition-all cursor-pointer border border-gray-800 group">
                <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Live Demo
                </a>
              </li>
              <li>
                <a href="#updates" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  What's New
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#docs" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Blog
                </a>
              </li>
              <li>
                <a href="#help" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} EduFlex — Adaptive Learning for NGO Students
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
              <span>using AI & Modern Web Tech</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer