import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { BookOpen, FileText, Calendar, Building, LayoutDashboard, Home, MessageSquare, Clock, Play } from 'lucide-react';
import InstitutePanel from '../components/InstitutePanel';
import { useNavigate } from 'react-router-dom';
import DashboardChat from '../components/DashboardChat';

const Classroom = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const [classrooms, setClassrooms] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('classroom');
    const [selectedCreateClassroom, setSelectedCreateClassroom] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            fetchClassrooms();
            fetchTests();
        }
    }, [userData]);

    const fetchClassrooms = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendUrl + '/api/user/get-classrooms');
            if (data.success) {
                setClassrooms(data.classrooms);
                if (data.classrooms.length > 0) {
                    setSelectedCreateClassroom(data.classrooms[0]._id);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching classrooms');
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendUrl + '/api/tests/all');
            if (data.success) {
                setTests(data.tests);
            }
        } catch (error) {
            console.log("Failed to fetch tests:", error);
        }
    };

    const getSidebarItems = () => {
        const items = [
            { id: 'classroom', label: 'Classrooms', icon: BookOpen },
            { id: 'test-series', label: 'Test Series', icon: FileText },
            { id: 'chat', label: 'Discussions', icon: MessageSquare },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
        ];

        if (userData?.role === 'Administrator') {
            items.push({ id: 'institute', label: 'Institute', icon: Building });
        }

        return items;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex relative overflow-hidden">


            {/* Fixed Sidebar */}
            <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4 h-screen sticky top-0 z-20 flex flex-col">
                <div className="flex items-center gap-3 mb-8 px-2 mt-4">
                    <LayoutDashboard className="h-7 w-7 text-gray-900" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h2>
                </div>

                <nav className="space-y-2 flex-1">
                    {getSidebarItems().map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === item.id
                                ? ' text-gray-900 border border-gray-900/30 shadow-[0_0_15px_rgba(139,124,246,0.15)]'
                                : 'text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-gray-900' : 'text-gray-500'}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-200">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
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
                                <BookOpen className="h-8 w-8 text-gray-900" />
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {userData?.role === 'Administrator' ? 'Institute Classrooms' : 'My Classrooms'}
                                </h1>
                            </div>

                            {/* Classrooms Grid */}
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : classrooms.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
                                    <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-gray-700">No Classrooms Found</h2>
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
                                            onClick={() => navigate(`/classroom/${cls._id}`)}
                                            className="bg-white border border-gray-200 rounded-xl p-6 transition-all group cursor-pointer hover:border-gray-900/50 hover:shadow-lg hover:shadow-sm hover:-translate-y-1"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-900 transition-colors">{cls.name || cls.className}</h3>
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-300">{cls.level}</span>
                                            </div>
                                            <div className="space-y-2 mt-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Teachers</span>
                                                    <span className="text-gray-900 font-medium">{cls.teachers?.length || 0}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Students</span>
                                                    <span className="text-gray-900 font-medium">{cls.students?.length || 0}</span>
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
                                <Building className="h-8 w-8 text-gray-900" />
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Institute Management
                                </h1>
                            </div>
                            <InstitutePanel />
                        </div>
                    )}

                    {activeTab === 'test-series' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-gray-900" />
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Test Series
                                    </h1>
                                </div>
                                {userData?.role === 'Teacher' && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowCreateModal(!showCreateModal)}
                                            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Create New Test
                                        </button>

                                        {showCreateModal && (
                                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50">
                                                <h3 className="font-bold text-gray-900 text-sm mb-2">Select Classroom</h3>
                                                {classrooms.length > 0 ? (
                                                    <div className="space-y-3">
                                                        <select
                                                            value={selectedCreateClassroom}
                                                            onChange={(e) => setSelectedCreateClassroom(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-gray-900"
                                                        >
                                                            {classrooms.map(c => (
                                                                <option key={c._id} value={c._id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => {
                                                                setShowCreateModal(false);
                                                                navigate(`/classroom/${selectedCreateClassroom}/tests/create`);
                                                            }}
                                                            className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"
                                                        >
                                                            Continue to Builder
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500">You have no classrooms.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
                                {tests && tests.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tests.map(test => {
                                            const now = new Date();
                                            const start = new Date(test.startTime);
                                            const end = new Date(start.getTime() + test.durationMinutes * 60000);
                                            const isActive = now >= start && now <= end;
                                            const isPast = now > end;
                                            const isUpcoming = now < start;

                                            const isOffline = test.mode === 'Offline';
                                            let statusBadge = null;
                                            
                                            if (isOffline) {
                                                statusBadge = <span className="px-2 py-1 bg-gray-100 text-gray-800 text-[10px] font-bold rounded-full uppercase border border-gray-200">Offline</span>;
                                            } else {
                                                if (isUpcoming) statusBadge = <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase">Upcoming</span>;
                                                if (isActive) statusBadge = <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase">Active</span>;
                                                if (isPast) statusBadge = <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase">Ended</span>;
                                            }

                                            return (
                                                <div key={test._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="pr-2 min-w-0">
                                                                <h3 className="font-bold text-gray-900 text-lg truncate">{test.title}</h3>
                                                                <p className="text-xs font-medium text-indigo-500 mt-0.5 truncate">{test.classroomId?.name}</p>
                                                            </div>
                                                            {statusBadge}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mb-4 space-y-1">
                                                            <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Starts: {start.toLocaleString()}</p>
                                                            {!isOffline ? (
                                                                <>
                                                                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-0" /> Duration: {test.durationMinutes} mins</p>
                                                                    <p className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {test.questions?.length || 0} Questions</p>
                                                                </>
                                                            ) : (
                                                                <p className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Max Marks: {test.maxMarks}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                                        {userData?.role === 'Teacher' && (
                                                            <button
                                                                onClick={() => navigate(isOffline ? `/classroom/${test.classroomId._id}/tests/${test._id}/offline-marks` : `/classroom/${test.classroomId._id}/tests/${test._id}/results`)}
                                                                className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                {isOffline ? 'Enter Marks' : 'View Marks'}
                                                            </button>
                                                        )}
                                                        {userData?.role === 'Student' && (
                                                            test.isSubmitted ? (
                                                                isOffline ? (
                                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50">
                                                                        <span className="text-sm font-bold text-green-600">
                                                                            Score: {test.score} / {test.maxMarks}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => navigate(`/classroom/${test.classroomId._id}/tests/${test._id}/take`)}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                                                                    >
                                                                        <span className="text-sm font-bold text-green-600">
                                                                            Score: {test.score}
                                                                        </span>
                                                                        <span className="text-xs text-green-700 font-medium ml-1 hidden sm:inline">Review</span>
                                                                    </button>
                                                                )
                                                            ) : (
                                                                isOffline ? (
                                                                    <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                                        Not Graded Yet
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => navigate(`/classroom/${test.classroomId._id}/tests/${test._id}/take`)}
                                                                        disabled={!isActive}
                                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${isActive ? 'bg-gray-900 hover:bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                                    >
                                                                        <Play className="w-3.5 h-3.5" /> {isActive ? 'Start Test' : 'Not Available'}
                                                                    </button>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border border-gray-200 rounded-xl bg-gray-100/30">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText className="h-8 w-8 text-gray-500" />
                                        </div>
                                        <p className="text-gray-500">No tests available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <div className="mb-4 flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-gray-900" />
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Discussions
                                </h1>
                            </div>
                            <div className="h-[calc(100vh-140px)]">
                                <DashboardChat classrooms={classrooms} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-gray-900" />
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Schedule
                                </h1>
                            </div>
                            <div className="text-center py-32 bg-white border border-gray-200 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <Calendar className="w-96 h-96" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-900/30">
                                        <Calendar className="h-10 w-10 text-gray-900" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Scheduling Module</h2>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Timetables, live classes calendar, and scheduling features are currently under development.
                                    </p>
                                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 border border-gray-300 text-gray-700 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 "></div>
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

