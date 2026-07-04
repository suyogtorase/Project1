import React, { useState, useEffect, useContext } from 'react'
import assets2 from '../assets2/assets2'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { User, Camera, FileText, Building, Hash, TrendingUp, ArrowLeft } from 'lucide-react'

const ProfilePage = () => {

    const { userData, getUserData } = useContext(AppContent)
    const navigate = useNavigate()

    const [selectedImg, setSelectedImg] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [instituteName, setInstituteName] = useState('')
    const [rollno, setRollno] = useState('')
    const [level, setLevel] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load user data
    useEffect(() => {
        if (userData) {
            setName(userData.name || '')
            setBio(userData.bio || '')
            setImagePreview(userData.profilePic || '')
            setInstituteName(userData.instituteName || '')
            setRollno(userData.rollno || '')
            setLevel(userData.level || '')
        }
    }, [userData])

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        setSelectedImg(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name.trim()) return toast.error("Name is required")

        try {
            setIsSubmitting(true)

            let profilePicBase64 = null
            if (selectedImg) {
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
                rollno: rollno.trim() || undefined,
                level: level.trim() || undefined,
            })

            if (data.success) {
                toast.success('Profile updated successfully!')
                await getUserData()
                navigate('/chat')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#0f0f1e] flex items-center justify-center px-6 py-12 relative overflow-hidden'>
            
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8b7cf6]/20 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/chat')}
                className="absolute left-6 top-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors group z-10"
            >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
            </button>

            {/* Profile Card */}
            <div className='relative w-full max-w-xl bg-[#1a1a2e] border border-gray-800 rounded-2xl shadow-2xl backdrop-blur-xl'>
                
                {/* Header */}
                <div className='bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] p-6 rounded-t-2xl'>
                    <h2 className='text-2xl font-bold text-white'>Profile Settings</h2>
                    <p className='text-sm text-white/80 mt-1'>Update your personal information</p>
                </div>

                <form onSubmit={handleSubmit} className='p-8 space-y-5'>
                    
                    {/* Profile Picture Upload */}
                    <div className='flex flex-col items-center gap-4 pb-6 border-b border-gray-800'>
                        <div className='relative group'>
                            <label htmlFor="avatar" className='cursor-pointer'>
                                <div className='relative'>
                                    <img 
                                        src={imagePreview || assets2.avatar_icon}
                                        alt="Profile" 
                                        className='w-28 h-28 rounded-full object-cover border-4 border-[#8b7cf6]/30 group-hover:border-[#8b7cf6] transition-all'
                                    />
                                    <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <Camera className='h-8 w-8 text-white' />
                                    </div>
                                </div>
                                <input 
                                    onChange={handleImageChange} 
                                    type="file" 
                                    id='avatar' 
                                    accept='.jpg, .png, .jpeg' 
                                    hidden 
                                />
                            </label>
                        </div>
                        <div className='text-center'>
                            <p className='text-sm font-medium text-white'>Profile Picture</p>
                            <p className='text-xs text-gray-400 mt-1'>Click to upload (Max 5MB)</p>
                        </div>
                    </div>

                    {/* Name Field */}
                    <div className='space-y-2'>
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-300'>
                            <User className='h-4 w-4' />
                            Full Name
                        </label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            type="text"
                            required
                            placeholder='Enter your full name'
                            className='w-full px-4 py-2.5 bg-[#2a2a3e] border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8b7cf6] transition-all text-sm'
                        />
                    </div>

                    {/* Bio Field */}
                    <div className='space-y-2'>
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-300'>
                            <FileText className='h-4 w-4' />
                            Bio
                        </label>
                        <textarea
                            onChange={(e) => setBio(e.target.value)}
                            value={bio}
                            placeholder='Tell us about yourself'
                            className='w-full px-4 py-2.5 bg-[#2a2a3e] border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8b7cf6] transition-all resize-none text-sm'
                            rows={3}
                        ></textarea>
                    </div>

                    {/* Institute Name Field (Read-only) */}
                    {userData?.role !== 'Administrator' && (
                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-medium text-gray-300'>
                                <Building className='h-4 w-4' />
                                Institute Name
                            </label>
                            <input
                                value={instituteName || 'Not assigned to an institute'}
                                type="text"
                                disabled
                                className='w-full px-4 py-2.5 bg-[#2a2a3e] border-2 border-gray-700 rounded-lg text-gray-400 cursor-not-allowed transition-all text-sm'
                            />
                        </div>
                    )}

                    {/* Student Only Fields */}
                    {userData?.role === "Student" && (
                        <div className='grid grid-cols-2 gap-4'>
                            {/* Roll Number */}
                            <div className='space-y-2'>
                                <label className='flex items-center gap-2 text-sm font-medium text-gray-300'>
                                    <Hash className='h-4 w-4' />
                                    Roll No
                                </label>
                                <input
                                    onChange={(e) => setRollno(e.target.value)}
                                    value={rollno}
                                    type="text"
                                    placeholder='Roll number'
                                    className='w-full px-4 py-2.5 bg-[#2a2a3e] border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8b7cf6] transition-all text-sm'
                                />
                            </div>

                            {/* Level */}
                            <div className='space-y-2'>
                                <label className='flex items-center gap-2 text-sm font-medium text-gray-300'>
                                    <TrendingUp className='h-4 w-4' />
                                    Level
                                </label>
                                <input
                                    onChange={(e) => setLevel(e.target.value)}
                                    value={level}
                                    type="text"
                                    placeholder='Beginner/Intermediate'
                                    className='w-full px-4 py-2.5 bg-[#2a2a3e] border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8b7cf6] transition-all text-sm'
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-full py-3 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#8b7cf6]/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6 text-sm'
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>

                    {/* Role Badge */}
                    {userData?.role && (
                        <div className='flex justify-center pt-4'>
                            <span className='inline-flex items-center gap-2 px-4 py-2 bg-[#8b7cf6]/10 border border-[#8b7cf6]/30 rounded-full text-[#8b7cf6] text-xs font-medium'>
                                {userData.role === 'Teacher' ? '👨‍🏫 Teacher Account' : userData.role === 'Administrator' ? '🏢 Administrator Account' : '🎓 Student Account'}
                            </span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default ProfilePage