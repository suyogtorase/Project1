import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, Search, MessageSquare, Send, Users, Info, ArrowLeft, MoreVertical } from 'lucide-react';
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

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !selectedGroup) return;

        setSending(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/messages/classroom/${selectedGroup._id}`, {
                text: newMessage
            });
            if (data.success) {
                setNewMessage("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };
    
    if (loading) {
        return (
            <div className="h-screen bg-[#0f0f1e] flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-[#8b7cf6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    const canSendMessages = userData?.role === 'Student' || userData?.role === 'Teacher';
    const filteredClassrooms = classrooms.filter(cls => cls.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="h-screen bg-[#0f0f1e] text-white flex flex-col overflow-hidden relative">
            <Navbar />
            
            {/* Animated Background Blob */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8b7cf6]/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

            <div className="flex-1 w-full max-w-[90rem] mx-auto px-2 sm:px-6 pt-24 pb-6 overflow-hidden flex gap-4 lg:gap-6 relative z-10 transition-all duration-300">
                
                {/* Left Sidebar - Groups List */}
                <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 bg-[#16162a]/80 backdrop-blur-xl border border-gray-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300
                                ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>
                    
                    <div className="p-6 border-b border-gray-800 shrink-0 bg-gradient-to-b from-[#1a1a32] to-transparent">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                            <Users className="h-7 w-7 text-indigo-400" />
                            Groups
                        </h2>
                        
                        <div className="mt-6 relative group">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search your classrooms..." 
                                className="w-full bg-[#0a0a14] border border-gray-700 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#8b7cf6] focus:ring-1 focus:ring-[#8b7cf6] transition-all text-gray-200 placeholder-gray-500"
                            />
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-[#8b7cf6] transition-colors" />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 !scrollbar-thin !scrollbar-thumb-gray-700 !scrollbar-track-transparent">
                        {filteredClassrooms.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center justify-center h-full text-gray-500">
                                <div className="w-16 h-16 bg-[#2a2a3e]/50 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="h-8 w-8 text-gray-600" />
                                </div>
                                <p className="font-medium text-gray-400 text-sm">No groups found.</p>
                                <p className="text-xs mt-1">Try a different search term.</p>
                            </div>
                        ) : (
                            filteredClassrooms.map(cls => (
                                <button 
                                    key={cls._id}
                                    onClick={() => setSelectedGroup(cls)}
                                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 border ${
                                        selectedGroup?._id === cls._id 
                                            ? 'bg-gradient-to-r from-[#8b7cf6]/20 to-[#6366f1]/10 border-[#8b7cf6]/30 shadow-[0_4px_20px_rgba(139,124,246,0.1)]' 
                                            : 'bg-transparent border-transparent hover:bg-[#2a2a44]/50 hover:border-gray-700/50'
                                    }`}
                                >
                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-300 ${
                                        selectedGroup?._id === cls._id ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-105' : 'bg-[#2a2a44] text-gray-400 border border-gray-700/50'
                                    }`}>
                                        {cls.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <h3 className={`font-semibold truncate transition-colors duration-200 ${selectedGroup?._id === cls._id ? 'text-white' : 'text-gray-300'}`}>
                                            {cls.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-medium text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-md truncate">
                                                {cls.level}
                                            </span>
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {(cls.students?.length || 0) + (cls.teachers?.length || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 bg-[#16162a]/95 backdrop-blur-2xl border border-gray-700/50 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative
                                ${!selectedGroup ? 'hidden md:flex' : 'flex'}`}>
                    
                    {selectedGroup ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 md:px-6 md:py-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-b from-[#1a1a32] to-transparent shrink-0">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setSelectedGroup(null)}
                                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#2a2a3e] transition-colors bg-[#2a2a44]/50"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                        <span className="text-lg">{selectedGroup.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white text-lg leading-tight">{selectedGroup.name}</h2>
                                        <p className="text-xs font-medium text-indigo-300 mt-0.5">{selectedGroup.level}</p>
                                    </div>
                                </div>
                                
                                <button className="text-gray-400 hover:text-white transition-colors p-2.5 rounded-xl hover:bg-[#2a2a44] border border-transparent hover:border-gray-700">
                                    <Info className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundColor: 'rgba(15, 15, 30, 0.7)' }}>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-in fade-in zoom-in duration-500 h-full">
                                        <div className="w-20 h-20 bg-[#2a2a44]/30 rounded-full flex items-center justify-center mb-4">
                                            <MessageSquare className="h-8 w-8 opacity-50" />
                                        </div>
                                        <p className="font-semibold text-gray-300 text-lg">It's quiet here...</p>
                                        <p className="text-sm mt-1 text-gray-500">Be the first to send a message in {selectedGroup.name}!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId?._id === userData?.userId;
                                        const isTeacherMessage = !isMe && msg.senderId?.role === 'Teacher';
                                        
                                        return (
                                            <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 fade-in duration-300`} style={{ animationFillMode: 'both' }}>
                                                
                                                {!isMe && (
                                                    <span className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-2 ml-1">
                                                        {msg.senderId?.name} 
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${isTeacherMessage ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                                            {msg.senderId?.role || 'Student'}
                                                        </span>
                                                    </span>
                                                )}
                                                
                                                <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                                                    <div className={`px-5 py-3.5 shadow-md text-[15px] leading-relaxed
                                                        ${isMe 
                                                            ? 'bg-gradient-to-br from-[#8b7cf6] to-[#6366f1] text-white rounded-3xl rounded-br-sm shadow-indigo-500/20 text-right' 
                                                            : isTeacherMessage
                                                                ? 'bg-[#1a1a32] text-gray-100 rounded-3xl rounded-bl-sm border border-indigo-500/30'
                                                                : 'bg-[#22223a] text-gray-200 rounded-3xl rounded-bl-sm border border-gray-700/50'
                                                        }`}
                                                    >
                                                        <p className="break-words font-medium">{msg.text}</p>
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
                            <div className="p-4 md:px-6 md:py-5 bg-gradient-to-t from-[#16162a] to-[#16162a]/95 border-t border-gray-800 shrink-0">
                                {canSendMessages ? (
                                    <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex items-end gap-3">
                                        <div className="flex-1 bg-[#0a0a14] border border-gray-700 text-white rounded-[24px] focus-within:border-[#8b7cf6] focus-within:ring-2 focus-within:ring-[#8b7cf6]/20 transition-all shadow-inner flex items-center p-1.5 px-4">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Write your beautiful message..."
                                                className="w-full bg-transparent border-none py-3 focus:outline-none text-[15px] placeholder-gray-600"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="h-[52px] w-[52px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:scale-100 active:scale-95 group focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
                                        >
                                            <Send className={`h-5 w-5 ${!newMessage.trim() || sending ? '' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'}`} />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-4 text-gray-400 text-sm font-medium bg-[#0a0a14] rounded-2xl border border-gray-800/50">
                                        Administrators have view-only access to classroom discussions.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center p-8 relative overflow-hidden bg-gradient-to-b from-transparent to-[#1a1a32]/20">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
                            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-500 opacity-80">
                                <div className="w-28 h-28 bg-gradient-to-br from-[#2a2a44] to-[#1a1a32] rounded-full flex items-center justify-center mb-6 shadow-2xl border border-gray-700/50">
                                    <MessageSquare className="h-12 w-12 text-indigo-400/80" />
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">Your Groups Space</h3>
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
