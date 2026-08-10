// import React from 'react'
// import Navbar from '../components/Navbar'
// import Header from '../components/Header'

// const Home = () => {
//   return (
//     <div className="flex flex-col items-center justify-center">
//       <Navbar/>
//       <Header/>
//     </div>
//   )
// }

// export default Home

import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import MiddleSection from '../components/MiddleSection'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="w-full min-h-screen">
      <Navbar/>
      <Header/>
      <MiddleSection/>
      <Footer/>
    </div>
  )
}

export default Home
