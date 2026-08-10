import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, Search, MessageSquare, Send, Users, Info, ArrowLeft, MoreVertical, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';

const Groups = () => {
    const { backendUrl, userData, socket } = useContext(AppContent);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Chat state
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [imageData, setImageData] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (userData) {
            fetchClassrooms();
        }
    }, [userData]);

    const fetchClassrooms = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendUrl + '/api/user/get-classrooms');
            if (data.success) {
                setClassrooms(data.classrooms);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching groups');
        } finally {
            setLoading(false);
        }
    };

    // When a group is selected, fetch messages and join socket
    useEffect(() => {
        if (selectedGroup && socket) {
            fetchMessages(selectedGroup._id);
            socket.emit('joinClassroom', selectedGroup._id);

            const handleNewMessage = (message) => {
                // If message belongs to selected classroom, add it
                if (message.classroomId === selectedGroup._id) {
                    setMessages((prev) => [...prev, message]);
                }
            };

            socket.on('newClassroomMessage', handleNewMessage);

            return () => {
                socket.emit('leaveClassroom', selectedGroup._id);
                socket.off('newClassroomMessage', handleNewMessage);
            };
        }
    }, [selectedGroup, socket]);

    // Handle Unseen mark when selected
    useEffect(() => {
        if (selectedGroup && messages.length > 0 && userData) {
            const key = `classroom_${selectedGroup._id}_user_${userData.userId}_lastRead`;
            const latestMsgTime = new Date(messages[messages.length - 1].createdAt).getTime();
            localStorage.setItem(key, latestMsgTime.toString());
        }
    }, [messages, selectedGroup, userData]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const fetchMessages = async (id) => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(`${backendUrl}/api/messages/classroom/${id}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.log("Failed to fetch messages:", error);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageData(reader.result);
            setImagePreview(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);
    };

    const resetAttachment = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageData('');
        setImagePreview('');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageData) || sending || !selectedGroup) return;

        setSending(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/messages/classroom/${selectedGroup._id}`, {
                text: newMessage,
                image: imageData
            });
            if (data.success) {
                setNewMessage("");
                resetAttachment();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const canSendMessages = userData?.role === 'Student' || userData?.role === 'Teacher';
    const filteredClassrooms = classrooms.filter(cls => cls.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden relative">
            <Navbar />

            {/* Animated Background Blob */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gray-900/5 rounded-full  pointer-events-none "></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gray-1000/5 rounded-full  pointer-events-none"></div>

            <div className="flex-1 w-full max-w-[90rem] mx-auto px-2 sm:px-6 pt-24 pb-6 overflow-hidden flex gap-4 lg:gap-6 relative z-10 transition-all duration-300">

                {/* Left Sidebar - Groups List */}
                <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 bg-white/80  border border-gray-200 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300
                                ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>

                    <div className="p-6 border-b border-gray-100 shrink-0 bg-white">
                        <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-3">
                            <Users className="h-6 w-6 text-[#0F172A]" />
                            Classrooms
                        </h2>

                        <div className="mt-5 relative group">
                            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search classrooms..."
                                className="w-full bg-white border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-all text-gray-700 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 !scrollbar-thin !scrollbar-thumb-gray-700 !scrollbar-track-transparent">
                        {filteredClassrooms.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="h-8 w-8 text-gray-600" />
                                </div>
                                <p className="font-medium text-gray-500 text-sm">No groups found.</p>
                                <p className="text-xs mt-1">Try a different search term.</p>
                            </div>
                        ) : (
                            filteredClassrooms.map(cls => (
                                <button
                                    key={cls._id}
                                    onClick={() => setSelectedGroup(cls)}
                                    className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all duration-200 border ${selectedGroup?._id === cls._id
                                        ? 'bg-gray-50 border-gray-200 shadow-sm'
                                        : 'bg-white border-transparent hover:bg-gray-50/50 hover:border-gray-100'
                                        }`}
                                >
                                    <div className={`w-14 h-14 shrink-0 rounded-[14px] flex items-center justify-center text-white text-2xl font-bold transition-transform duration-300 ${selectedGroup?._id === cls._id ? 'bg-[#94A0AE]' : 'bg-[#94A0AE]'
                                        }`}>
                                        {cls.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left pt-1">
                                        <h3 className={`font-bold text-[15px] truncate transition-colors duration-200 ${selectedGroup?._id === cls._id ? 'text-[#1E293B]' : 'text-[#1E293B]'}`}>
                                            {cls.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[11px] font-medium text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded-md truncate">
                                                {cls.level}
                                            </span>
                                            <span className="text-[12px] font-medium text-[#64748B] flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" /> {(cls.students?.length || 0) + (cls.teachers?.length || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 bg-white/95 backdrop-blur-2xl border border-gray-300/50 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative
                                ${!selectedGroup ? 'hidden md:flex' : 'flex'}`}>

                    {selectedGroup ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 md:px-6 md:py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedGroup(null)}
                                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors bg-gray-100/50"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                        <span className="text-lg">{selectedGroup.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900 text-lg leading-tight">{selectedGroup.name}</h2>
                                        <p className="text-xs font-medium text-indigo-300 mt-0.5">{selectedGroup.level}</p>
                                    </div>
                                </div>

                                <button className="text-gray-500 hover:text-gray-900 transition-colors p-2.5 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-300">
                                    <Info className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-in fade-in zoom-in duration-500 h-full">
                                        <div className="w-20 h-20 bg-gray-100/30 rounded-full flex items-center justify-center mb-4">
                                            <MessageSquare className="h-8 w-8 opacity-50" />
                                        </div>
                                        <p className="font-semibold text-gray-700 text-lg">It's quiet here...</p>
                                        <p className="text-sm mt-1 text-gray-500">Be the first to send a message in {selectedGroup.name}!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId?._id === userData?.userId;
                                        const isTeacherMessage = !isMe && msg.senderId?.role === 'Teacher';

                                        return (
                                            <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 fade-in duration-300`} style={{ animationFillMode: 'both' }}>

                                                {!isMe && (
                                                    <span className="text-[11px] text-gray-500 mb-1.5 flex items-center gap-2 ml-1">
                                                        {msg.senderId?.name}
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${isTeacherMessage ? 'bg-indigo-500/10 text-gray-900 border-indigo-500/20' : 'bg-gray-800 text-gray-500 border-gray-300'}`}>
                                                            {msg.senderId?.role || 'Student'}
                                                        </span>
                                                    </span>
                                                )}

                                                <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                                                    <div className={`px-5 py-3.5 shadow-md text-[15px] leading-relaxed
                                                        ${isMe
                                                            ? 'bg-gray-900 text-white rounded-3xl rounded-br-sm shadow-indigo-500/20 text-right'
                                                            : isTeacherMessage
                                                                ? 'bg-gray-50 text-gray-900 rounded-3xl rounded-bl-sm border border-indigo-500/30'
                                                                : 'bg-gray-50 text-gray-800 rounded-3xl rounded-bl-sm border border-gray-300/50'
                                                        }`}
                                                    >
                                                        {msg.fileType === 'image' && msg.fileUrl ? (
                                                            <img src={msg.fileUrl} alt="uploaded" className="max-w-[200px] rounded-lg" />
                                                        ) : msg.fileUrl ? (
                                                            <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline break-words">
                                                                {msg.fileName || 'View File'}
                                                            </a>
                                                        ) : (
                                                            <p className="break-words font-medium">{msg.text}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`text-[10px] text-gray-500 mt-1.5 font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 md:px-6 md:py-5 bg-white border-t border-gray-200 shrink-0">
                                {canSendMessages ? (
                                    <div className="flex flex-col gap-2">
                                        {imagePreview && (
                                            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2 w-max border border-gray-200">
                                                <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                                                <button type="button" onClick={resetAttachment} className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer">Remove</button>
                                            </div>
                                        )}
                                        <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex items-end gap-3 w-full">
                                            <div className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 rounded-[24px] focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/20 transition-all shadow-inner flex items-center p-1.5 px-4">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Write your beautiful message..."
                                                    className="w-full bg-transparent border-none py-3 focus:outline-none text-[15px] placeholder-gray-600"
                                                />
                                                <input onChange={handleFileChange} type="file" id="groups-image" accept="image/png, image/jpeg, image/jpg" hidden />
                                                <label htmlFor="groups-image" className="cursor-pointer p-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                                                    <ImageIcon className="w-5 h-5" />
                                                </label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={(!newMessage.trim() && !imageData) || sending}
                                                className="h-[52px] w-[52px] rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:scale-100 active:scale-95 group focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
                                            >
                                                <Send className={`h-5 w-5 ${(!newMessage.trim() && !imageData) || sending ? '' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'}`} />
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm font-medium bg-gray-100 rounded-2xl border border-gray-200/50">
                                        Administrators have view-only access to classroom discussions.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center p-8 relative overflow-hidden bg-gray-50">
                            <div className="absolute inset-0  opacity-5"></div>
                            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500 opacity-80">
                                <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-gray-300/50">
                                    <MessageSquare className="h-12 w-12 text-gray-900/80" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-400 mb-3">Your Groups Space</h3>
                                <p className="max-w-sm text-sm font-medium text-gray-500">Pick a classroom from the left sidebar to dive into the conversation and stay connected.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #374151;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default Groups;
