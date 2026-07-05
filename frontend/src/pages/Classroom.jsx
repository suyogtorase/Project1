import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen } from 'lucide-react';
import InstitutePanel from '../components/InstitutePanel';

const Classroom = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

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
            toast.error(error.response?.data?.message || 'Error fetching classrooms');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f1e] text-white p-6 md:p-12 lg:pl-72 relative">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8b7cf6]/10 rounded-full filter blur-3xl animate-pulse" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-8 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-[#8b7cf6]" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        My Classrooms
                    </h1>
                </div>

                {userData?.role === 'Administrator' && (
                    <div className="mb-10">
                        <InstitutePanel />
                    </div>
                )}

                {/* Classrooms Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#8b7cf6] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : classrooms.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a2e] border border-gray-800 rounded-2xl">
                        <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-300">No Classrooms Found</h2>
                        <p className="text-gray-500 mt-2">
                            {userData?.role === 'Administrator' 
                                ? 'Create a classroom above to get started.' 
                                : 'You are not assigned to any classrooms yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.map((cls) => (
                            <div 
                                key={cls._id} 
                                onClick={() => userData?.role === 'Administrator' ? window.location.href = `/classroom/${cls._id}` : null}
                                className={`bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 transition-all group ${userData?.role === 'Administrator' ? 'cursor-pointer hover:border-[#8b7cf6]/50' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#8b7cf6] transition-colors">{cls.name || cls.className}</h3>
                                    <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-gray-300">{cls.level}</span>
                                </div>
                                <div className="space-y-2 mt-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Teachers</span>
                                        <span className="text-white font-medium">{cls.teachers?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Students</span>
                                        <span className="text-white font-medium">{cls.students?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Classroom;
