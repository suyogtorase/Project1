import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, User, ArrowLeft, GraduationCap, Users, CalendarDays, Hash, Home, Layers, MessageSquare, Send } from 'lucide-react';
import Navbar from '../components/Navbar';

const ClassroomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData, socket } = useContext(AppContent);
    
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Chat state
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // Unseen logic
    const [unseenCount, setUnseenCount] = useState(0);
    const [firstUnseenMessageId, setFirstUnseenMessageId] = useState(null);
    const firstUnseenRef = useRef(null);

    const getStorageKey = () => {
        if (!userData || !id) return null;
        return `classroom_${id}_user_${userData.userId}_lastRead`;
    };

    useEffect(() => {
        const key = getStorageKey();
        if (!key || messages.length === 0) return;

        if (isChatOpen) {
            const storedTimeStr = localStorage.getItem(key);
            const lastReadTime = storedTimeStr ? parseInt(storedTimeStr, 10) : 0;
            
            let foundFirstUnseen = null;
            for (let msg of messages) {
                const msgTime = new Date(msg.createdAt).getTime();
                if (msgTime > lastReadTime && msg.senderId?._id !== userData?.userId) {
                    foundFirstUnseen = msg._id;
                    break;
                }
            }
            setFirstUnseenMessageId(foundFirstUnseen);

            setUnseenCount(0);
            const latestMsgTime = new Date(messages[messages.length - 1].createdAt).getTime();
            localStorage.setItem(key, latestMsgTime.toString());
        } else {
            const storedTimeStr = localStorage.getItem(key);
            const lastReadTime = storedTimeStr ? parseInt(storedTimeStr, 10) : 0;
            
            let count = 0;
            for (let msg of messages) {
                const msgTime = new Date(msg.createdAt).getTime();
                if (msgTime > lastReadTime && msg.senderId?._id !== userData?.userId) {
                    count++;
                }
            }
            setUnseenCount(count);
            setFirstUnseenMessageId(null);
        }
    }, [messages, isChatOpen, userData, id]);

    useEffect(() => {
        if (userData) {
            fetchClassroomDetails();
            fetchMessages();
        }
    }, [userData, id]);

    useEffect(() => {
        if (socket && id) {
            socket.emit('joinClassroom', id);

            const handleNewMessage = (message) => {
                setMessages((prev) => [...prev, message]);
            };

            socket.on('newClassroomMessage', handleNewMessage);

            return () => {
                socket.emit('leaveClassroom', id);
                socket.off('newClassroomMessage', handleNewMessage);
            };
        }
    }, [socket, id]);

    useEffect(() => {
        if (isChatOpen) {
            setTimeout(() => {
                if (firstUnseenRef.current) {
                    firstUnseenRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTo({
                        top: chatContainerRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [isChatOpen]);

    useEffect(() => {
        if (isChatOpen && chatContainerRef.current && !firstUnseenMessageId) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const fetchClassroomDetails = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(`${backendUrl}/api/user/get-classroom/${id}`);
            if (data.success) {
                setClassroom(data.classroom);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching classroom details');
            navigate('/classroom');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
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
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/messages/classroom/${id}`, {
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
            <div className="min-h-screen bg-[#0f0f1e] flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-[#8b7cf6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!classroom) return null;

    const teacherCount = classroom.teachers?.length || 0;
    const studentCount = classroom.students?.length || 0;
    const createdDate = classroom.createdAt
        ? new Date(classroom.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';
    
    const canSendMessages = userData?.role === 'Student' || userData?.role === 'Teacher';

    return (
        <div className="min-h-screen bg-[#0f0f1e] text-white flex flex-col relative overflow-hidden">
            <Navbar />

            <div className="flex flex-1 pt-20 h-screen">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#8b7cf6]/10 rounded-full filter blur-3xl animate-pulse" />
                </div>

                {/* ───── LEFT SIDEBAR ───── */}
                <div className="w-72 flex-shrink-0 bg-[#1a1a2e] border-r border-gray-800 h-full sticky top-20 z-20 flex flex-col">
                    <div className="px-5 pt-6 pb-4 border-b border-gray-800">
                        <button
                            onClick={() => navigate('/classroom')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group mb-5"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Classrooms</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#8b7cf6]/20 rounded-xl">
                                <BookOpen className="h-6 w-6 text-[#8b7cf6]" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold text-white truncate">{classroom.name}</h2>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <GraduationCap className="h-3 w-3" /> {classroom.level}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-5 space-y-3 flex-1 overflow-y-auto">
                        <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Overview</p>

                        <div className="bg-[#2a2a3e]/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#8b7cf6]/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20">
                                <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{teacherCount}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Teachers Assigned</p>
                            </div>
                        </div>

                        <div className="bg-[#2a2a3e]/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#8b7cf6]/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                                <Users className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{studentCount}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Students Enrolled</p>
                            </div>
                        </div>

                        <div className="bg-[#2a2a3e]/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#8b7cf6]/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
                                <Layers className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none capitalize">{classroom.level}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Class Level</p>
                            </div>
                        </div>

                        <div className="bg-[#2a2a3e]/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#8b7cf6]/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                                <CalendarDays className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-none">{createdDate}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Created On</p>
                            </div>
                        </div>

                        <div className="bg-[#2a2a3e]/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-[#8b7cf6]/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center border border-rose-500/20">
                                <Hash className="h-5 w-5 text-rose-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-mono text-gray-300 truncate leading-none">{classroom._id}</p>
                                <p className="text-xs text-gray-400 mt-1">Classroom ID</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-4 border-t border-gray-800">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 border border-transparent hover:bg-[#2a2a3e] hover:text-white transition-all duration-200"
                        >
                            <Home className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-sm">Back to Home</span>
                        </button>
                    </div>
                </div>

                {/* ───── MAIN CONTENT ───── */}
                <div className="flex-1 h-full overflow-y-auto relative z-10 p-6 md:p-12 pb-20">
                    <div className="max-w-5xl mx-auto space-y-8">
                        
                        {/* Assigned Teachers Section */}
                        <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
                                <User className="h-5 w-5 text-[#8b7cf6]" />
                                Assigned Teachers ({teacherCount})
                            </h2>

                            {classroom.teachers && classroom.teachers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse border border-gray-800">
                                        <thead>
                                            <tr className="bg-[#2a2a3e]">
                                                <th className="p-4 text-sm font-semibold text-gray-300 border border-gray-800">Name</th>
                                                <th className="p-4 text-sm font-semibold text-gray-300 border border-gray-800">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classroom.teachers.map((teacher) => {
                                                const isCurrentUser = userData?.userId === teacher._id;
                                                return (
                                                    <tr key={teacher._id} className={`transition-colors ${isCurrentUser ? 'bg-[#8b7cf6]/20 border-l-4 border-[#8b7cf6]' : 'hover:bg-[#2a2a3e]/50'}`}>
                                                        <td className="p-4 border border-gray-800 relative space-x-2">
                                                            <div className="flex items-center gap-3 inline-flex">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                                                                    {teacher.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-white text-sm font-medium">{teacher.name}</span>
                                                            </div>
                                                            {isCurrentUser && (
                                                                <span className="inline-flex px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-[#8b7cf6] text-white tracking-wide uppercase shadow-sm">
                                                                    You
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 border border-gray-800 text-sm text-gray-400">
                                                            {teacher.email || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 border border-gray-800 rounded-xl bg-[#2a2a3e]/30">
                                    <div className="w-16 h-16 bg-[#2a2a3e] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <p className="text-gray-400">No teachers are currently assigned to this classroom.</p>
                                </div>
                            )}
                        </div>

                        {/* Enrolled Students Section */}
                        <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
                                <Users className="h-5 w-5 text-[#8b7cf6]" />
                                Enrolled Students ({studentCount})
                            </h2>

                            {classroom.students && classroom.students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse border border-gray-800">
                                        <thead>
                                            <tr className="bg-[#2a2a3e]">
                                                <th className="p-4 text-sm font-semibold text-gray-300 border border-gray-800">Roll No</th>
                                                <th className="p-4 text-sm font-semibold text-gray-300 border border-gray-800">Name</th>
                                                <th className="p-4 text-sm font-semibold text-gray-300 border border-gray-800">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classroom.students.map((studentRecord) => {
                                                const isCurrentUser = userData?.userId === studentRecord.user?._id;
                                                return (
                                                    <tr key={studentRecord._id} className={`transition-colors ${isCurrentUser ? 'bg-[#8b7cf6]/20 border-l-4 border-[#8b7cf6]' : 'hover:bg-[#2a2a3e]/50'}`}>
                                                        <td className="p-4 border border-gray-800 text-sm text-gray-300 items-center gap-2">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-[#8b7cf6]/20 text-[#8b7cf6] rounded-full text-xs font-bold">
                                                                {studentRecord.rollno}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 border border-gray-800 relative space-x-2">
                                                            {studentRecord.user ? (
                                                                <div className="flex items-center gap-3 inline-flex">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                                                                        {studentRecord.user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-white text-sm font-medium">{studentRecord.user.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 italic inline-flex">User Data Unavailable</span>
                                                            )}
                                                            {isCurrentUser && (
                                                                <span className="inline-flex px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-[#8b7cf6] text-white tracking-wide uppercase shadow-sm">
                                                                    You
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 border border-gray-800 text-sm text-gray-400">
                                                            {studentRecord.user?.email || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-[#2a2a3e] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <p className="text-gray-400">No students are currently enrolled in this classroom.</p>
                                </div>
                            )}
                        </div>

                        {/* Group Chat Section Toggle */}
                        {!isChatOpen ? (
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="relative w-full bg-[#1a1a2e] hover:bg-[#2a2a3e] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center justify-center gap-3 transition-colors group animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: '200ms' }}
                            >
                                <div className="relative">
                                    <MessageSquare className="h-6 w-6 text-[#8b7cf6] group-hover:scale-110 transition-transform" />
                                    {unseenCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow">
                                            {unseenCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-lg font-bold text-white">Open Classroom Discussion</span>
                            </button>
                        ) : (
                        <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-0 shadow-xl flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#1a1a2e] rounded-t-2xl">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-[#8b7cf6]" />
                                    Classroom Discussion
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs px-3 py-1 bg-[#8b7cf6]/20 text-[#8b7cf6] rounded-full border border-[#8b7cf6]/30">Live Chat</span>
                                    <button 
                                        onClick={() => setIsChatOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0f0f1e]/50">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId?._id === userData?.userId;
                                        const isTeacherMessage = !isMe && msg.senderId?.role === 'Teacher';
                                        const isFirstUnseen = msg._id === firstUnseenMessageId;
                                        
                                        return (
                                            <div key={idx} className="w-full flex flex-col">
                                                {isFirstUnseen && (
                                                    <div ref={firstUnseenRef} className="flex items-center justify-center my-4 opacity-80">
                                                        <div className="h-px bg-red-500/50 flex-1"></div>
                                                        <span className="text-[10px] text-red-500 font-bold px-3 uppercase tracking-wider">New Messages</span>
                                                        <div className="h-px bg-red-500/50 flex-1"></div>
                                                    </div>
                                                )}
                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {isMe ? (
                                                    <span className="text-xs text-gray-400 mb-1 mr-1 flex items-center gap-1">
                                                        <span className="text-[10px] bg-[#8b7cf6]/20 text-[#8b7cf6] px-1.5 rounded font-medium">You</span>
                                                        {msg.senderId?.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 mb-1 ml-1 flex items-center gap-1">
                                                        {msg.senderId?.name} 
                                                        <span className={`text-[10px] px-1.5 rounded ${isTeacherMessage ? 'bg-[#8b7cf6]/30 text-[#8b7cf6] font-semibold tracking-wide' : 'bg-gray-700/50 text-gray-300'}`}>
                                                            {msg.senderId?.role}
                                                        </span>
                                                    </span>
                                                )}
                                                <div 
                                                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                                        isMe 
                                                        ? 'bg-[#8b7cf6] text-white rounded-tr-sm shadow-md' 
                                                        : isTeacherMessage
                                                            ? 'bg-[#1a1a3a] text-gray-100 rounded-tl-sm border-2 border-[#8b7cf6]/60 shadow-[0_4px_12px_rgba(139,124,246,0.15)]'
                                                            : 'bg-[#2a2a3e] text-gray-200 rounded-tl-sm border border-gray-700'
                                                    }`}
                                                >
                                                    <p className="text-sm">{msg.text}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-500 mt-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-[#1a1a2e] border-t border-gray-800 rounded-b-2xl">
                                {canSendMessages ? (
                                    <form onSubmit={sendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-[#2a2a3e] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b7cf6] focus:ring-1 focus:ring-[#8b7cf6] transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="bg-[#8b7cf6] hover:bg-[#7c6ce6] text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                                        >
                                            <Send className={`h-5 w-5 ${!newMessage.trim() || sending ? '' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`} />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-2 text-gray-500 text-sm italic">
                                        Administrators have view-only access to classroom discussions.
                                    </div>
                                )}
                            </div>
                        </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetails;
