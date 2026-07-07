import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, FileText, Calendar, Building, LayoutDashboard, Home } from 'lucide-react';
import InstitutePanel from '../components/InstitutePanel';
import { useNavigate } from 'react-router-dom';

const Classroom = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('classroom');
    const navigate = useNavigate();

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

    const getSidebarItems = () => {
        const items = [
            { id: 'classroom', label: 'Classrooms', icon: BookOpen },
            { id: 'test-series', label: 'Test Series', icon: FileText },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
        ];
        
        if (userData?.role === 'Administrator') {
            items.push({ id: 'institute', label: 'Institute', icon: Building });
        }
        
        return items;
    };

    return (
        <div className="min-h-screen bg-[#0f0f1e] text-white flex relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8b7cf6]/10 rounded-full filter blur-3xl animate-pulse" />
            </div>

            {/* Fixed Sidebar */}
            <div className="w-64 flex-shrink-0 bg-[#1a1a2e] border-r border-gray-800 p-4 h-screen sticky top-0 z-20 flex flex-col">
                <div className="flex items-center gap-3 mb-8 px-2 mt-4">
                    <LayoutDashboard className="h-7 w-7 text-[#8b7cf6]" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Dashboard
                    </h2>
                </div>
                
                <nav className="space-y-2 flex-1">
                    {getSidebarItems().map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                                activeTab === item.id 
                                    ? 'bg-[#8b7cf6]/20 text-[#8b7cf6] border border-[#8b7cf6]/30 shadow-[0_0_15px_rgba(139,124,246,0.15)]' 
                                    : 'text-gray-400 border border-transparent hover:bg-[#2a2a3e] hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#8b7cf6]' : 'text-gray-500'}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-800">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 border border-transparent hover:bg-[#2a2a3e] hover:text-white transition-all duration-200"
                    >
                        <Home className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Back to Home</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 h-screen overflow-y-auto relative z-10 p-6 md:p-12">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'classroom' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-[#8b7cf6]" />
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    {userData?.role === 'Administrator' ? 'Institute Classrooms' : 'My Classrooms'}
                                </h1>
                            </div>

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
                                            ? 'Create a classroom to get started.' 
                                            : 'You are not assigned to any classrooms yet.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {classrooms.map((cls) => (
                                        <div 
                                            key={cls._id} 
                                            onClick={() => userData?.role === 'Administrator' ? navigate(`/classroom/${cls._id}`) : null}
                                            className={`bg-[#1a1a2e] border border-gray-800 rounded-xl p-6 transition-all group ${userData?.role === 'Administrator' ? 'cursor-pointer hover:border-[#8b7cf6]/50 hover:shadow-lg hover:shadow-[#8b7cf6]/10 hover:-translate-y-1' : ''}`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white group-hover:text-[#8b7cf6] transition-colors">{cls.name || cls.className}</h3>
                                                <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-gray-300 border border-gray-700">{cls.level}</span>
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
                    )}

                    {activeTab === 'institute' && userData?.role === 'Administrator' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex items-center gap-3">
                                <Building className="h-8 w-8 text-[#8b7cf6]" />
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Institute Management
                                </h1>
                            </div>
                            <InstitutePanel />
                        </div>
                    )}

                    {activeTab === 'test-series' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex items-center gap-3">
                                <FileText className="h-8 w-8 text-[#8b7cf6]" />
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Test Series
                                </h1>
                            </div>
                            <div className="text-center py-32 bg-[#1a1a2e] border border-gray-800 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <FileText className="w-96 h-96" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#8b7cf6]/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#8b7cf6]/30">
                                        <FileText className="h-10 w-10 text-[#8b7cf6]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Test Series Module</h2>
                                    <p className="text-gray-400 max-w-md mx-auto">
                                        Comprehensive testing and assessment features are currently under development and will be available soon.
                                    </p>
                                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2a2a3e] border border-gray-700 text-gray-300 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                        Coming Soon
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-[#8b7cf6]" />
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Schedule
                                </h1>
                            </div>
                            <div className="text-center py-32 bg-[#1a1a2e] border border-gray-800 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <Calendar className="w-96 h-96" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#8b7cf6]/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#8b7cf6]/30">
                                        <Calendar className="h-10 w-10 text-[#8b7cf6]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Scheduling Module</h2>
                                    <p className="text-gray-400 max-w-md mx-auto">
                                        Timetables, live classes calendar, and scheduling features are currently under development.
                                    </p>
                                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2a2a3e] border border-gray-700 text-gray-300 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                        Coming Soon
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Classroom;

