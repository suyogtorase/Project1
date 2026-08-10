import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, Search, MessageSquare, Send, Users, Info, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const DashboardChat = ({ classrooms }) => {
    const { backendUrl, userData, socket } = useContext(AppContent);
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

    const canSendMessages = userData?.role === 'Student' || userData?.role === 'Teacher';
    const filteredClassrooms = classrooms.filter(cls => cls.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="h-full w-full flex gap-4 lg:gap-6 relative transition-all duration-300">
            {/* Left Sidebar - Groups List */}
            <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 bg-white border border-gray-200 rounded-3xl flex flex-col overflow-hidden shadow-xl transition-all duration-300
                            ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>

                <div className="p-6 border-b border-gray-200 shrink-0 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-gray-900" />
                        Classrooms
                    </h2>

                    <div className="mt-4 relative group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search classrooms..."
                            className="w-full bg-white border border-gray-300 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-800 placeholder-gray-500"
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-gray-900 transition-colors" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredClassrooms.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-500 text-sm">No classrooms found.</p>
                        </div>
                    ) : (
                        filteredClassrooms.map(cls => (
                            <button
                                key={cls._id}
                                onClick={() => setSelectedGroup(cls)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 border ${selectedGroup?._id === cls._id
                                        ? 'bg-gray-100 border-gray-300 shadow-sm'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                            >
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold transition-transform duration-300 ${selectedGroup?._id === cls._id ? 'bg-gray-900' : 'bg-gray-400'
                                    }`}>
                                    {cls.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <h3 className={`font-semibold text-sm truncate transition-colors duration-200 ${selectedGroup?._id === cls._id ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {cls.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md truncate">
                                            {cls.level}
                                        </span>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
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
            <div className={`flex-1 bg-white border border-gray-200 rounded-3xl flex flex-col shadow-xl overflow-hidden relative
                            ${!selectedGroup ? 'hidden md:flex' : 'flex'}`}>

                {selectedGroup ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedGroup(null)}
                                    className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold">
                                    <span className="text-base">{selectedGroup.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base leading-tight">{selectedGroup.name}</h2>
                                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{selectedGroup.level}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="font-semibold text-gray-600 text-base">It's quiet here...</p>
                                    <p className="text-xs mt-1 text-gray-500">Be the first to send a message in {selectedGroup.name}!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId?._id === userData?.userId;
                                    const isTeacherMessage = !isMe && msg.senderId?.role === 'Teacher';

                                    return (
                                        <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <span className="text-[10px] text-gray-500 mb-1 flex items-center gap-1.5 ml-1">
                                                    {msg.senderId?.name}
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase border ${isTeacherMessage ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                                                        {msg.senderId?.role || 'Student'}
                                                    </span>
                                                </span>
                                            )}

                                            <div className="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                                                <div className={`px-4 py-2.5 shadow-sm text-sm
                                                    ${isMe
                                                        ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm'
                                                        : isTeacherMessage
                                                            ? 'bg-white text-gray-900 rounded-2xl rounded-tl-sm border-2 border-gray-900/10'
                                                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200'
                                                    }`}
                                                >
                                                    {msg.fileType === 'image' && msg.fileUrl ? (
                                                        <img src={msg.fileUrl} alt="uploaded" className="max-w-[200px] rounded-lg" />
                                                    ) : msg.fileUrl ? (
                                                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline break-words">
                                                            {msg.fileName || 'View File'}
                                                        </a>
                                                    ) : (
                                                        <p className="break-words">{msg.text}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`text-[10px] text-gray-400 mt-1 font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 md:p-4 bg-white border-t border-gray-200 shrink-0">
                            {canSendMessages ? (
                                <div className="flex flex-col gap-2">
                                    {imagePreview && (
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2 w-max border border-gray-200">
                                            <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                                            <button type="button" onClick={resetAttachment} className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer">Remove</button>
                                        </div>
                                    )}
                                    <form onSubmit={sendMessage} className="flex items-center gap-2 md:gap-3">
                                        <div className="flex-1 bg-gray-100 border border-gray-200 rounded-xl focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all flex items-center px-3 py-1">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Write a message..."
                                                className="w-full bg-transparent border-none py-2 focus:outline-none text-sm placeholder-gray-500"
                                            />
                                            <input onChange={handleFileChange} type="file" id="classroom-image" accept="image/png, image/jpeg, image/jpg" hidden />
                                            <label htmlFor="classroom-image" className="cursor-pointer p-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                                                <ImageIcon className="w-5 h-5" />
                                            </label>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={(!newMessage.trim() && !imageData) || sending}
                                            className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gray-900 hover:bg-black text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <Send className={`h-4 w-4 md:h-5 md:w-5 ${(!newMessage.trim() && !imageData) || sending ? '' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'}`} />
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="text-center py-2 text-gray-500 text-xs font-medium bg-gray-50 rounded-lg border border-gray-200">
                                    Administrators have view-only access to discussions.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-gray-50/50">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 border border-gray-200">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Classroom Discussions</h3>
                        <p className="max-w-xs text-sm text-gray-500">Select a classroom from the sidebar to view messages and participate in the discussion.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardChat;
