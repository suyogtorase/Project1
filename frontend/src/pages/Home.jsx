import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import MiddleSection from '../components/MiddleSection'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <Header />
      <MiddleSection />
      <Footer />
    </div>
  )
}

export default Home
