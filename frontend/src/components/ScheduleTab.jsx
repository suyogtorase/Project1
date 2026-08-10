import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { Calendar, Plus, Clock, Users, BookOpen, Trash2 } from 'lucide-react';

const ScheduleTab = ({ classrooms }) => {
    const { backendUrl, userData } = useContext(AppContent);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [subject, setSubject] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    // Available teachers for selected classroom
    const [availableTeachers, setAvailableTeachers] = useState([]);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(`${backendUrl}/api/schedule`);
            if (data.success) {
                setSchedules(data.schedules);
            }
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    // Update available teachers when a classroom is selected
    useEffect(() => {
        if (selectedClassroom) {
            const classroom = classrooms.find(c => c._id === selectedClassroom);
            if (classroom && classroom.teachers) {
                setAvailableTeachers(classroom.teachers);
                if (classroom.teachers.length > 0) {
                    setSelectedTeacher(classroom.teachers[0]._id || classroom.teachers[0]);
                } else {
                    setSelectedTeacher('');
                }
            }
        } else {
            setAvailableTeachers([]);
            setSelectedTeacher('');
        }
    }, [selectedClassroom, classrooms]);

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/schedule/create`, {
                classroomId: selectedClassroom,
                teacherId: selectedTeacher,
                subject,
                startTime,
                endTime
            });
            
            if (data.success) {
                toast.success(data.message);
                setShowForm(false);
                setSubject('');
                setStartTime('');
                setEndTime('');
                fetchSchedules(); // Refresh the list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating schedule');
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getTimeOnly = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString(undefined, options);
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {userData?.role === 'Administrator' && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Institute Schedules</h2>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-medium"
                    >
                        {showForm ? 'Cancel' : <><Plus className="w-4 h-4"/> Create Schedule</>}
                    </button>
                </div>
            )}

            {userData?.role === 'Administrator' && showForm && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">New Schedule</h3>
                    <form onSubmit={handleCreateSchedule} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
                                <select 
                                    value={selectedClassroom} 
                                    onChange={(e) => setSelectedClassroom(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900"
                                    required
                                >
                                    <option value="">Select a classroom...</option>
                                    {classrooms.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} - {c.level}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                <select 
                                    value={selectedTeacher} 
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
                                    required
                                    disabled={!selectedClassroom || availableTeachers.length === 0}
                                >
                                    <option value="">{availableTeachers.length === 0 && selectedClassroom ? "No teachers allocated" : "Select a teacher..."}</option>
                                    {availableTeachers.map(t => (
                                        <option key={t._id || t} value={t._id || t}>{t.name || t.email || "Teacher"}</option>
                                    ))}
                                </select>
                                {selectedClassroom && availableTeachers.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">Please allocate teachers to this classroom first.</p>
                                )}
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Topic (Optional)</label>
                                <input 
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Advanced Calculus"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input 
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input 
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors"
                            >
                                Save Schedule
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                </div>
            ) : schedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedules.map((schedule) => (
                        <div key={schedule._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Status Indicator */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            
                            <div className="flex justify-between items-start mb-3">
                                <div className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100 uppercase tracking-wider">
                                    {formatDate(schedule.startTime).split(',')[0]} {/* Just the day */}
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{schedule.subject || "Scheduled Lecture"}</h3>
                            
                            <div className="space-y-2 mt-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{getTimeOnly(schedule.startTime)} - {getTimeOnly(schedule.endTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <span>{schedule.classroom?.name} ({schedule.classroom?.level})</span>
                                </div>
                                {userData?.role !== 'Teacher' && schedule.teacher && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>Teacher: {schedule.teacher.name || "Assigned"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-gray-200 rounded-xl bg-white/50">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Schedules</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        {userData?.role === 'Administrator' 
                            ? "You haven't created any schedules yet. Click the 'Create Schedule' button to get started." 
                            : "There are no classes scheduled for the next 24 hours."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ScheduleTab;
