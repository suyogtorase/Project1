import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, User, ArrowLeft, GraduationCap, Users, CalendarDays, Hash, Home, Layers, MessageSquare, Send, FileText, Clock, Play } from 'lucide-react';
import Navbar from '../components/Navbar';

const ClassroomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData, socket } = useContext(AppContent);
    
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (userData) {
            fetchClassroomDetails();
        }
    }, [userData, id]);



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



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative overflow-hidden">
            <Navbar />

            <div className="flex flex-1 pt-20 h-screen">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-20 right-1/4 w-96 h-96 bg-gray-100 rounded-full filter  " />
                </div>

                {/* ───── LEFT SIDEBAR ───── */}
                <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 h-full sticky top-20 z-20 flex flex-col">
                    <div className="px-5 pt-6 pb-4 border-b border-gray-200">
                        <button
                            onClick={() => navigate('/classroom')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group mb-5"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Classrooms</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-2.5  rounded-xl">
                                <BookOpen className="h-6 w-6 text-gray-900lue-600" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold text-gray-900 truncate">{classroom.name}</h2>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <GraduationCap className="h-3 w-3" /> {classroom.level}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-5 space-y-3 flex-1 overflow-y-auto">
                        <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Overview</p>

                        <div className="bg-gray-100/60 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-900/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/20">
                                <User className="h-5 w-5 text-gray-900lue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 leading-none">{teacherCount}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Teachers Assigned</p>
                            </div>
                        </div>

                        <div className="bg-gray-100/60 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-900/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                                <Users className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 leading-none">{studentCount}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Students Enrolled</p>
                            </div>
                        </div>

                        <div className="bg-gray-100/60 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-900/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
                                <Layers className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 leading-none capitalize">{classroom.level}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Class Level</p>
                            </div>
                        </div>

                        <div className="bg-gray-100/60 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-900/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                                <CalendarDays className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 leading-none">{createdDate}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Created On</p>
                            </div>
                        </div>

                        <div className="bg-gray-100/60 border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-900/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center border border-rose-500/20">
                                <Hash className="h-5 w-5 text-rose-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-mono text-gray-700 truncate leading-none">{classroom._id}</p>
                                <p className="text-xs text-gray-500 mt-1">Classroom ID</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-4 border-t border-gray-200">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
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
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-300 pb-4">
                                <User className="h-5 w-5 text-gray-900lue-600" />
                                Assigned Teachers ({teacherCount})
                            </h2>

                            {classroom.teachers && classroom.teachers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-4 text-sm font-semibold text-gray-700 border border-gray-200">Name</th>
                                                <th className="p-4 text-sm font-semibold text-gray-700 border border-gray-200">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classroom.teachers.map((teacher) => {
                                                const isCurrentUser = userData?.userId === teacher._id;
                                                return (
                                                    <tr key={teacher._id} className={`transition-colors ${isCurrentUser ? ' border-l-4 border-gray-900' : 'hover:bg-gray-100/50'}`}>
                                                        <td className="p-4 border border-gray-200 relative space-x-2">
                                                            <div className="flex items-center gap-3 inline-flex">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-gray-900 text-xs font-bold shadow-md shadow-indigo-500/20">
                                                                    {teacher.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-gray-900 text-sm font-medium">{teacher.name}</span>
                                                            </div>
                                                            {isCurrentUser && (
                                                                <span className="inline-flex px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-gray-900 text-white tracking-wide uppercase shadow-sm">
                                                                    You
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 border border-gray-200 text-sm text-gray-500">
                                                            {teacher.email || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-gray-900enter py-10 border border-gray-200 rounded-xl bg-gray-100/30">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <p className="text-gray-500">No teachers are currently assigned to this classroom.</p>
                                </div>
                            )}
                        </div>

                        {/* Enrolled Students Section */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-300 pb-4">
                                <Users className="h-5 w-5 text-gray-900lue-600" />
                                Enrolled Students ({studentCount})
                            </h2>

                            {classroom.students && classroom.students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-4 text-sm font-semibold text-gray-700 border border-gray-200">Roll No</th>
                                                <th className="p-4 text-sm font-semibold text-gray-700 border border-gray-200">Name</th>
                                                <th className="p-4 text-sm font-semibold text-gray-700 border border-gray-200">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classroom.students.map((studentRecord) => {
                                                const isCurrentUser = userData?.userId === studentRecord.user?._id;
                                                return (
                                                    <tr key={studentRecord._id} className={`transition-colors ${isCurrentUser ? ' border-l-4 border-gray-900' : 'hover:bg-gray-100/50'}`}>
                                                        <td className="p-4 border border-gray-200 text-sm text-gray-700 items-center gap-2">
                                                            <span className="w-6 h-6 flex items-center justify-center  text-gray-900lue-600 rounded-full text-xs font-bold">
                                                                {studentRecord.rollno}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 border border-gray-200 relative space-x-2">
                                                            {studentRecord.user ? (
                                                                <div className="flex items-center gap-3 inline-flex">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-gray-900 text-xs font-bold shadow-md shadow-indigo-500/20">
                                                                        {studentRecord.user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-gray-900 text-sm font-medium">{studentRecord.user.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 italic inline-flex">User Data Unavailable</span>
                                                            )}
                                                            {isCurrentUser && (
                                                                <span className="inline-flex px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-gray-900 text-white tracking-wide uppercase shadow-sm">
                                                                    You
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 border border-gray-200 text-sm text-gray-500">
                                                            {studentRecord.user?.email || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-gray-900enter py-10">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <p className="text-gray-500">No students are currently enrolled in this classroom.</p>
                                </div>
                            )}
                        </div>



                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetails;
