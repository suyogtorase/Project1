import React, { useState, useEffect, useContext } from 'react'
import assets2 from '../assets2/assets2'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ProfilePage = () => {

    const { userData, getUserData } = useContext(AppContent)
    const navigate = useNavigate()
    const [selectedImg, setSelectedImg] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load user data when component mounts or userData changes
    useEffect(() => {
        if (userData) {
            setName(userData.name || '')
            setBio(userData.bio || '')
            setImagePreview(userData.profilePic || '')
        }
    }, [userData])

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        setSelectedImg(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!name.trim()) {
            toast.error('Name is required')
            return
        }

        try {
            setIsSubmitting(true)

            let profilePicBase64 = null
            if (selectedImg) {
                // Convert image to base64
                profilePicBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result)
                    reader.onerror = reject
                    reader.readAsDataURL(selectedImg)
                })
            }

            const { data } = await axios.put('/api/user/update-profile', {
                name: name.trim(),
                bio: bio.trim() || undefined,
                profilePic: profilePicBase64 || undefined,
            })

            if (data.success) {
                toast.success('Profile updated successfully!')
                // Refresh user data in context
                await getUserData()
                navigate('/chat')
            } else {
                toast.error(data.message || 'Failed to update profile')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to update profile')
        } finally {
            setIsSubmitting(false)
        }
    }

  return (
    <div className='min-h-screen bg-black bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2
      border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
            <h3 className='text-lg'>Profile details</h3>
            <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
                <input onChange={handleImageChange} type="file" id='avatar' accept='.jpg, .png, .jpeg' hidden/>
                <img src={imagePreview || assets2.avatar_icon} 
                alt="" className={`w-12 h-12 rounded-full object-cover ${!imagePreview && 'opacity-50'}`}/>
                <span className='text-sm'>Upload Profile Image</span>
            </label>
            <input onChange={(e)=>setName(e.target.value)} value={name}
            type="text" required placeholder='Your Name' 
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2
            focus:ring-violet-500'/>

            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write Profile Bio'
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2
            focus:ring-violet-500' rows={4}></textarea>

            <button 
                type='submit' 
                disabled={isSubmitting}
                className='bg-gradient-to-r from-purple-400
                to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed'>
                {isSubmitting ? 'Saving...' : 'Save'}
            </button>
        </form>
        <img className='max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10' src={assets2.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfilePage
