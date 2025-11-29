import React, { useEffect, useState, useContext } from 'react'
import assets2 from '../assets2/assets2'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'

const RightSidebar = ({selectedUser}) => {
  const { onlineUsers, socket } = useContext(AppContent)
  const [images, setImages] = useState([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  useEffect(() => {
    if (!selectedUser?._id) {
      setImages([])
      return
    }

    const fetchImages = async () => {
      try {
        setIsLoadingImages(true)
        const { data } = await axios.get(`/api/messages/images/${selectedUser._id}`)
        if (data.success) {
          setImages(data.images || [])
        } else {
          toast.error(data.message || 'Failed to load images')
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Failed to load images')
      } finally {
        setIsLoadingImages(false)
      }
    }

    fetchImages()
  }, [selectedUser?._id])

  // Refresh images when new message with image is received
  useEffect(() => {
    if (!socket || !selectedUser?._id) return

    const handleNewMessage = (message) => {
      if (message.image && (
        message.senderId === selectedUser._id || 
        message.receiverId === selectedUser._id
      )) {
        setImages(prev => {
          if (!prev.includes(message.image)) {
            return [message.image, ...prev]
          }
          return prev
        })
      }
    }

    socket.on('newMessage', handleNewMessage)
    return () => {
      socket.off('newMessage', handleNewMessage)
    }
  }, [socket, selectedUser?._id])

  const isSelectedUserOnline = selectedUser?._id && onlineUsers.includes(selectedUser._id)

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll 
    ${selectedUser ? 'max-md:hidden' : ''}`}>
      <div className='pt-15 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUser?.profilePic || assets2.avatar_icon} alt=""
        className='w-20 aspect-[1/1] rounded-full object-cover' />
        <span className={`w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
            <span className={`w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            {selectedUser.name}
        </h1>
        <p className='text-gray-300'>{selectedUser.email}</p>
        <p className='px-10 mx-auto text-center'>{selectedUser.bio || 'No bio yet'}</p>
      </div>

      <hr className='border-[#ffffff50] my-4'/>

      <div className='px-5 text-xs'>
        <p className='mb-2'>Media</p>
        {isLoadingImages ? (
          <p className='text-gray-400 text-center py-4'>Loading images...</p>
        ) : images.length === 0 ? (
          <p className='text-gray-400 text-center py-4'>No images shared yet</p>
        ) : (
          <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80' >
            {images.map((url, index) => (
              <div 
                key={index} 
                onClick={() => window.open(url, '_blank')} 
                className='cursor-pointer rounded overflow-hidden hover:opacity-100 transition-opacity'>
                <img src={url} alt={`Media ${index + 1}`} className='w-full h-24 object-cover rounded-md'/>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600
                text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>
                    Logout
      </button>

    </div>
  )
}

export default RightSidebar
