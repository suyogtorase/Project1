import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { Building, Plus, Users, UserPlus, BookOpen } from 'lucide-react';

const InstitutePanel = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContent);
    const [instituteName, setInstituteName] = useState('');
    const [location, setLocation] = useState('');
    const [className, setClassName] = useState('');
    const [classLevel, setClassLevel] = useState('');
    const [targetUserId, setTargetUserId] = useState('');

    // New states for Add Student
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    const [studentLevel, setStudentLevel] = useState('');

    // New states for Assign Student to Classroom
    const [assignStudentId, setAssignStudentId] = useState('');
    const [assignStudentName, setAssignStudentName] = useState('');
    const [assignClassroomId, setAssignClassroomId] = useState('');
    const [classrooms, setClassrooms] = useState([]);
    const [instituteStudents, setInstituteStudents] = useState([]);
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);

    // New states for Teachers
    const [teacherName, setTeacherName] = useState('');
    const [teacherEmail, setTeacherEmail] = useState('');
    const [assignTeacherId, setAssignTeacherId] = useState('');
    const [assignTeacherName, setAssignTeacherName] = useState('');
    const [assignTeacherClassroomId, setAssignTeacherClassroomId] = useState('');
    const [instituteTeachers, setInstituteTeachers] = useState([]);
    const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

    useEffect(() => {
        if (userData?.role === 'Administrator' && userData?.isVerifiedByAdmin) {
            fetchClassrooms();
            fetchInstituteStudents();
            fetchInstituteTeachers();
        }
    }, [userData]);
    
    const fetchInstituteStudents = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendUrl + '/api/user/get-institute-students');
            if (data.success) {
                setInstituteStudents(data.students);
            }
        } catch (error) {
            console.error("Error fetching institute students:", error);
        }
    };

    const fetchInstituteTeachers = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendUrl + '/api/user/get-institute-teachers');
            if (data.success) {
                setInstituteTeachers(data.teachers);
            }
        } catch (error) {
            console.error("Error fetching institute teachers:", error);
        }
    };

    const fetchClassrooms = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendUrl + '/api/user/get-classrooms');
            if (data.success) {
                setClassrooms(data.classrooms);
            }
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        }
    };

    const handleRequestInstitute = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/request-institute', { instituteName, location });
            if (data.success) {
                toast.success('Institute request submitted successfully');
                getUserData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error requesting institute');
        }
    };

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/create-classroom', { className, level: classLevel });
            if (data.success) {
                toast.success('Classroom created successfully');
                setClassName('');
                setClassLevel('');
                fetchClassrooms(); // Refresh the list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating classroom');
        }
    };

    const handleAssignUser = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/assign-user', { targetUserId });
            if (data.success) {
                toast.success('User assigned successfully');
                setTargetUserId('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error assigning user');
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/add-student', {
                name: studentName,
                email: studentEmail,
                rollno: studentRollNo,
                level: studentLevel
            });
            if (data.success) {
                toast.success('Student added successfully. Email sent with credentials.');
                setStudentName('');
                setStudentEmail('');
                setStudentRollNo('');
                setStudentLevel('');
                fetchInstituteStudents(); // Refresh students
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding student');
        }
    };

    const handleAssignStudentToClassroom = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/assign-student-classroom', {
                targetUserId: assignStudentId,
                classroomId: assignClassroomId
            });
            if (data.success) {
                toast.success('Student assigned to classroom successfully');
                setAssignStudentId('');
                setAssignStudentName('');
                setAssignClassroomId('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error assigning student to classroom');
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/add-teacher', {
                name: teacherName,
                email: teacherEmail
            });
            if (data.success) {
                toast.success('Teacher added successfully. Email sent with credentials.');
                setTeacherName('');
                setTeacherEmail('');
                fetchInstituteTeachers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding teacher');
        }
    };

    const handleAssignTeacherToClassroom = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/user/assign-teacher-classroom', {
                targetUserId: assignTeacherId,
                classroomId: assignTeacherClassroomId
            });
            if (data.success) {
                toast.success('Teacher assigned to classroom successfully');
                setAssignTeacherId('');
                setAssignTeacherName('');
                setAssignTeacherClassroomId('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error assigning teacher to classroom');
        }
    };

    if (userData?.role !== 'Administrator') return null;

    return (
        <div className="p-6 bg-[#2a2a3e] border border-gray-700 rounded-xl mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-[#8b7cf6]" />
                Institute Management
            </h3>

            {!userData?.instituteName && !userData?.isVerifiedByAdmin ? (
                <form onSubmit={handleRequestInstitute} className="space-y-4">
                    <p className="text-sm text-gray-300">You don't have an institute yet. Request one below.</p>
                    <input
                        type="text"
                        placeholder="Institute Name"
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                    />
                    <button type="submit" className="px-4 py-2 bg-[#8b7cf6] text-white rounded-lg text-sm hover:bg-[#7c6ce6] transition-colors">
                        Request Institute
                    </button>
                </form>
            ) : userData?.instituteName && !userData?.isVerifiedByAdmin ? (
                <p className="text-sm text-yellow-400 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                    Your institute request ({userData.instituteName}) is currently Pending admin approval.
                </p>
            ) : userData?.instituteName && userData?.isVerifiedByAdmin ? (
                <div className="space-y-6">
                    <div className="p-4 bg-[#1a1a2e] border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-400 font-medium">Active Institute: {userData.instituteName}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Create Classroom */}
                        <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
                            <form onSubmit={handleCreateClassroom} className="space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <Plus className="h-4 w-4 text-[#8b7cf6]" /> Create Classroom
                                </h4>
                                <input
                                    type="text"
                                    placeholder="Classroom Name"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Level (e.g., High School)"
                                    value={classLevel}
                                    onChange={(e) => setClassLevel(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                />
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] text-white rounded-lg text-sm font-medium hover:opacity-90">
                                    Create Classroom
                                </button>
                            </form>
                        </div>

                        {/* Assign User to Institute */}
                        <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
                            <form onSubmit={handleAssignUser} className="space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <Users className="h-4 w-4 text-[#8b7cf6]" /> Assign Teacher/Student to Institute
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">Link an existing user to your institute using their User ID.</p>
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                />
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] text-white rounded-lg text-sm font-medium hover:opacity-90">
                                    Assign to Institute
                                </button>
                            </form>
                        </div>

                        {/* Add New Student (Admission) */}
                        <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
                            <form onSubmit={handleAddStudent} className="space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <UserPlus className="h-4 w-4 text-[#8b7cf6]" /> Add New Student (Admission)
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">Create a new student account. They will receive an email with their login credentials.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={studentEmail}
                                        onChange={(e) => setStudentEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Roll No (Optional)"
                                        value={studentRollNo}
                                        onChange={(e) => setStudentRollNo(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Level (Optional)"
                                        value={studentLevel}
                                        onChange={(e) => setStudentLevel(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
                                    Admit Student
                                </button>
                            </form>
                        </div>

                        {/* Assign Student to Classroom */}
                        <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
                            <form onSubmit={handleAssignStudentToClassroom} className="space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <BookOpen className="h-4 w-4 text-[#8b7cf6]" /> Assign Student to Classroom
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">Assign an existing student of your institute to a classroom.</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type student name..."
                                        value={assignStudentName}
                                        onChange={(e) => {
                                            setAssignStudentName(e.target.value);
                                            setAssignStudentId('');
                                            setShowStudentDropdown(true);
                                        }}
                                        onFocus={() => setShowStudentDropdown(true)}
                                        required
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                    {showStudentDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-[#2a2a3e] border border-gray-600 rounded-lg max-h-40 overflow-y-auto shadow-xl">
                                            {instituteStudents
                                                .filter(s => s.name.toLowerCase().includes(assignStudentName.toLowerCase()))
                                                .map(student => (
                                                    <div 
                                                        key={student._id} 
                                                        className="px-3 py-2 text-sm text-white hover:bg-[#8b7cf6] cursor-pointer"
                                                        onMouseDown={(e) => {
                                                            // onMouseDown instead of onClick to fire before input blur
                                                            e.preventDefault();
                                                            setAssignStudentName(student.name);
                                                            setAssignStudentId(student._id);
                                                            setShowStudentDropdown(false);
                                                        }}
                                                    >
                                                        {student.name} <span className="text-gray-400 text-xs ml-1">({student.email})</span>
                                                    </div>
                                                ))}
                                            {instituteStudents.filter(s => s.name.toLowerCase().includes(assignStudentName.toLowerCase())).length === 0 && (
                                                <div className="px-3 py-2 text-sm text-gray-400">No matching students found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <select
                                    value={assignClassroomId}
                                    onChange={(e) => setAssignClassroomId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                >
                                    <option value="" disabled>Select a Classroom</option>
                                    {classrooms.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.name} ({cls.level})</option>
                                    ))}
                                </select>
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
                                    Assign to Classroom
                                </button>
                            </form>
                        </div>

                        {/* Add New Teacher */}
                        <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
                            <form onSubmit={handleAddTeacher} className="space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <UserPlus className="h-4 w-4 text-[#8b7cf6]" /> Add New Teacher
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">Create a new teacher account. They will receive an email with their login credentials.</p>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={teacherName}
                                        onChange={(e) => setTeacherName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={teacherEmail}
                                        onChange={(e) => setTeacherEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
                                    Add Teacher
                                </button>
                            </form>
                        </div>

                        {/* Assign Teacher to Classroom */}
                        <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
                            <form onSubmit={handleAssignTeacherToClassroom} className="space-y-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <BookOpen className="h-4 w-4 text-[#8b7cf6]" /> Assign Teacher to Classroom
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">Assign an existing teacher to a classroom.</p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type teacher name..."
                                        value={assignTeacherName}
                                        onChange={(e) => {
                                            setAssignTeacherName(e.target.value);
                                            setAssignTeacherId('');
                                            setShowTeacherDropdown(true);
                                        }}
                                        onFocus={() => setShowTeacherDropdown(true)}
                                        required
                                        className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                    />
                                    {showTeacherDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-[#2a2a3e] border border-gray-600 rounded-lg max-h-40 overflow-y-auto shadow-xl">
                                            {instituteTeachers
                                                .filter(t => t.name.toLowerCase().includes(assignTeacherName.toLowerCase()))
                                                .map(teacher => (
                                                    <div 
                                                        key={teacher._id} 
                                                        className="px-3 py-2 text-sm text-white hover:bg-[#8b7cf6] cursor-pointer"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setAssignTeacherName(teacher.name);
                                                            setAssignTeacherId(teacher._id);
                                                            setShowTeacherDropdown(false);
                                                        }}
                                                    >
                                                        {teacher.name} <span className="text-gray-400 text-xs ml-1">({teacher.email})</span>
                                                    </div>
                                                ))}
                                            {instituteTeachers.filter(t => t.name.toLowerCase().includes(assignTeacherName.toLowerCase())).length === 0 && (
                                                <div className="px-3 py-2 text-sm text-gray-400">No matching teachers found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <select
                                    value={assignTeacherClassroomId}
                                    onChange={(e) => setAssignTeacherClassroomId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-[#2a2a3e] border border-gray-600 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                                >
                                    <option value="" disabled>Select a Classroom</option>
                                    {classrooms.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.name} ({cls.level})</option>
                                    ))}
                                </select>
                                <button type="submit" className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90">
                                    Assign Teacher
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default InstitutePanel;
