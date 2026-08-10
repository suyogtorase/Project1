import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Megaphone, Plus, Edit2, Trash2, X, Clock } from "lucide-react";

const Announcements = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (userData) {
            fetchAnnouncements();
        }
    }, [userData]);

    const fetchAnnouncements = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(`${backendUrl}/api/announcements`);
            if (data.success) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (announcement = null) => {
        if (announcement) {
            setIsEditing(true);
            setCurrentAnnouncementId(announcement._id);
            setFormData({ title: announcement.title, content: announcement.content });
        } else {
            setIsEditing(false);
            setCurrentAnnouncementId(null);
            setFormData({ title: "", content: "" });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: "", content: "" });
        setIsEditing(false);
        setCurrentAnnouncementId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) return;

        setSubmitting(true);
        try {
            axios.defaults.withCredentials = true;
            let res;
            if (isEditing) {
                res = await axios.put(`${backendUrl}/api/announcements/${currentAnnouncementId}`, formData);
            } else {
                res = await axios.post(`${backendUrl}/api/announcements/create`, formData);
            }

            if (res.data.success) {
                toast.success(res.data.message);
                fetchAnnouncements();
                handleCloseModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;

        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.delete(`${backendUrl}/api/announcements/${id}`);
            if (data.success) {
                toast.success(data.message);
                fetchAnnouncements();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete announcement");
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isAdmin = userData?.role === "Administrator";

    return (
        <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden relative">
            <Navbar />
            
            <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                            <Megaphone className="h-6 w-6 text-gray-900" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Institute Announcements</h1>
                            <p className="text-sm text-gray-500 mt-1">Stay updated with the latest news from your institute</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <button 
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            New Announcement
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Megaphone className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No announcements yet</h3>
                            <p className="text-gray-500 text-sm">Check back later for updates from your institute.</p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div key={announcement._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.title}</h3>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-[10px]">
                                                    {announcement.createdBy?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                {announcement.createdBy?.name || "Admin"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(announcement.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at {new Date(announcement.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                                    </div>
                                    
                                    {isAdmin && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button 
                                                onClick={() => handleOpenModal(announcement)}
                                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(announcement._id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEditing ? "Edit Announcement" : "Create Announcement"}
                            </h2>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm"
                                        placeholder="Enter announcement title..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message Content</label>
                                    <textarea 
                                        required
                                        rows="6"
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all text-sm resize-none"
                                        placeholder="Type the announcement message here..."
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                                    className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Megaphone className="w-4 h-4" />
                                    )}
                                    {isEditing ? "Save Changes" : "Post Announcement"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
