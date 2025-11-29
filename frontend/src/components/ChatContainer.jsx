import React, { useContext, useEffect, useRef, useState } from 'react'
import assets2 from '../assets2/assets2'
import { formatMessageTime } from '../lib/utils'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ChatContainer = ({selectedUser, setSelectedUser}) => {
    const scrollEnd = useRef()
    const { userData, socket, onlineUsers } = useContext(AppContent)
    const [messages, setMessages] = useState([])
    const [messageText, setMessageText] = useState('')
    const [imageData, setImageData] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)

    const normalizeId = (value) => typeof value === 'string' ? value : value?.toString?.() || ''

    useEffect(()=>{
        if(scrollEnd.current){
            scrollEnd.current.scrollIntoView({behavior: "smooth"})
        }
    }, [messages])

    useEffect(() => {
        if(!selectedUser?._id) {
            setMessages([])
            return
        }

        setMessages([])

        const fetchMessages = async () => {
            try {
                setIsLoadingMessages(true)
                const { data } = await axios.get(`/api/messages/${selectedUser._id}`)
                if(data.success){
                    setMessages(data.messages)
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message)
            } finally {
                setIsLoadingMessages(false)
            }
        }

        fetchMessages()
    }, [selectedUser?._id])

    useEffect(() => {
        if(!socket) return

        const handleIncomingMessage = (message) => {
            const senderId = normalizeId(message.senderId)
            if(senderId === selectedUser?._id){
                setMessages(prev => [...prev, message])
                axios.put(`/api/messages/mark/${message._id}`).catch(()=>{})
            }
        }

        socket.on('newMessage', handleIncomingMessage)
        return () => {
            socket.off('newMessage', handleIncomingMessage)
        }
    }, [socket, selectedUser?._id])

    const resetAttachment = () => {
        if(imagePreview){
            URL.revokeObjectURL(imagePreview)
        }
        setImageData('')
        setImagePreview('')
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if(!file) return
        if(imagePreview){
            URL.revokeObjectURL(imagePreview)
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImageData(reader.result)
            setImagePreview(URL.createObjectURL(file))
        }
        reader.readAsDataURL(file)
    }

    const handleSendMessage = async () => {
        if(!selectedUser || (!messageText.trim() && !imageData)) return

        try {
            setIsSending(true)
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, {
                text: messageText.trim() || undefined,
                image: imageData || undefined,
            })

            if(data.success){
                setMessages(prev => [...prev, data.newMessage])
                setMessageText('')
                resetAttachment()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (event) => {
        if(event.key === 'Enter' && !event.shiftKey){
            event.preventDefault()
            handleSendMessage()
        }
    }

    if(!selectedUser){
        return (
            <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
                <img src={assets2.logo_icon} alt="" className='max-w-16'/>
                <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
            </div>
        )
    }

    const isSelectedUserOnline = onlineUsers.includes(selectedUser._id)

    return (
        <div className='h-full overflow-scroll relative backdrop-blur-lg'>

          <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
            <img src={selectedUser?.profilePic || assets2.avatar_icon} alt="" className='w-8 h-8 rounded-full object-cover'/>
            <div className='flex-1 text-white'>
                <p className='text-lg flex items-center gap-2'>
                    {selectedUser.name}
                    <span className={`w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </p>
                <p className='text-xs text-gray-300'>{selectedUser.email}</p>
            </div>
            <img onClick={()=> setSelectedUser(null)} src={assets2.arrow_icon} alt="" className='md:hidden max-w-7 cursor-pointer'/>
            <img src={assets2.help_icon} alt="" className='max-md:hidden max-w-5'/>
          </div>

          <div className='flex flex-col h-[calc(100%-130px)] overflow-y-scroll p-3 pb-28 gap-4'>
            {isLoadingMessages && <p className='text-xs text-gray-400 text-center py-4'>Loading messages...</p>}
            {!isLoadingMessages && messages.length === 0 && (
                <p className='text-xs text-gray-400 text-center py-4'>Start the conversation</p>
            )}
            {messages.map((msg)=> {
                const senderId = normalizeId(msg.senderId)
                const isMe = senderId === userData?.userId
                const messageKey = msg._id || `${senderId}-${msg.createdAt}`
                return (
                    <div key={messageKey} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {msg.image ? (
                            <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden'/>
                        ) : (
                            <p className={`p-3 max-w-[70%] text-sm font-light rounded-2xl break-words text-white
                                ${isMe ? 'bg-violet-500/60 rounded-br-none' : 'bg-gray-700/70 rounded-bl-none'}`}>
                                {msg.text}
                            </p>
                        )}
                        <div className='text-center text-[10px] text-gray-400 flex flex-col items-center gap-1'>
                            <img src={isMe ? (userData?.profilePic || assets2.avatar_icon) : (selectedUser?.profilePic || assets2.avatar_icon)} alt=""
                                className='w-6 h-6 rounded-full object-cover'/>
                            <p>{formatMessageTime(msg.createdAt || msg.updatedAt)}</p>
                        </div>
                    </div>
                )
            })}
            <div ref={scrollEnd}></div>
          </div>

          <div className='absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-3 bg-black/30 backdrop-blur-md'>
            {imagePreview && (
                <div className='flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2'>
                    <img src={imagePreview} alt="preview" className='w-12 h-12 rounded-lg object-cover'/>
                    <button onClick={resetAttachment} className='text-xs text-red-300'>Remove</button>
                </div>
            )}
            <div className='flex items-center gap-3'>
                <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
                    <textarea 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Send a Message' 
                        rows={1}
                        className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent resize-none' />
                    <input onChange={handleFileChange} type="file" id='image' accept='image/png, image/jpeg, image/jpg' hidden/>
                    <label htmlFor="image">
                        <img src={assets2.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer'/>
                    </label>
                </div>
                <button onClick={handleSendMessage} disabled={isSending} className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-600 disabled:opacity-50'>
                    <img src={assets2.send_button} alt="" className='w-5 cursor-pointer'/>
                </button>
            </div>
          </div>
        </div>
      )
}

export default ChatContainer
