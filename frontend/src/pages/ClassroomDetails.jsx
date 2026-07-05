import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, User, ArrowLeft, GraduationCap } from 'lucide-react';

const ClassroomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData } = useContext(AppContent);
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData?.role === 'Administrator') {
            fetchClassroomDetails();
        } else if (userData && userData.role !== 'Administrator') {
            toast.error("Unauthorized access");
            navigate('/classroom');
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
            <div className="min-h-screen bg-[#0f0f1e] flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-[#8b7cf6] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!classroom) return null;

    return (
        <div className="min-h-screen bg-[#0f0f1e] text-white p-6 md:p-12 lg:pl-72 relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#8b7cf6]/10 rounded-full filter blur-3xl animate-pulse" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/classroom')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Classrooms
                </button>

                <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-8 shadow-xl mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#8b7cf6]/20 rounded-xl">
                            <BookOpen className="h-8 w-8 text-[#8b7cf6]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{classroom.name}</h1>
                            <p className="text-gray-400 mt-1 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> Level: {classroom.level}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a2e] border border-gray-800 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
                        <User className="h-5 w-5 text-[#8b7cf6]" />
                        Enrolled Students ({classroom.students?.length || 0})
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
                                    {classroom.students.map((studentRecord) => (
                                        <tr key={studentRecord._id} className="hover:bg-[#2a2a3e]/50 transition-colors">
                                            <td className="p-4 border border-gray-800 text-sm text-gray-300 flex items-center gap-2">
                                                <span className="w-6 h-6 flex items-center justify-center bg-[#8b7cf6]/20 text-[#8b7cf6] rounded-full text-xs font-bold">
                                                    {studentRecord.rollno}
                                                </span>
                                            </td>
                                            <td className="p-4 border border-gray-800">
                                                {studentRecord.user ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                                            {studentRecord.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-white text-sm font-medium">{studentRecord.user.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 italic">User Data Unavailable</span>
                                                )}
                                            </td>
                                            <td className="p-4 border border-gray-800 text-sm text-gray-400">
                                                {studentRecord.user?.email || "-"}
                                            </td>
                                        </tr>
                                    ))}
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
            </div>
        </div>
    );
};

export default ClassroomDetails;
