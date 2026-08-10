import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { ArrowLeft, Save, FileText, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const OfflineMarksEntry = () => {
    const { id: classroomId, testId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData } = useContext(AppContent);

    const [test, setTest] = useState(null);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [testId, classroomId]);

    const fetchData = async () => {
        try {
            axios.defaults.withCredentials = true;

            // Fetch Test Details
            const testRes = await axios.get(`${backendUrl}/api/tests/${testId}`);
            if (testRes.data.success) {
                setTest(testRes.data.test);
            }

            // Fetch Classroom Students
            const classRes = await axios.get(`${backendUrl}/api/user/get-classroom/${classroomId}`);
            let classStudents = [];
            if (classRes.data.success) {
                classStudents = classRes.data.classroom.students.map(s => s.user);
                setStudents(classStudents);
            }

            // Fetch Existing Results
            const resultsRes = await axios.get(`${backendUrl}/api/tests/${testId}/results`);
            if (resultsRes.data.success) {
                const initialMarks = {};
                resultsRes.data.results.forEach(res => {
                    if (res.student) {
                        initialMarks[res.student._id] = res.score;
                    }
                });
                setMarks(initialMarks);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, value) => {
        let numVal = parseInt(value);
        if (isNaN(numVal)) numVal = '';
        if (numVal !== '' && test?.maxMarks && numVal > test.maxMarks) numVal = test.maxMarks;
        if (numVal !== '' && numVal < 0) numVal = 0;

        setMarks(prev => ({ ...prev, [studentId]: numVal }));
    };

    const handleSaveMarks = async () => {
        setIsSaving(true);
        try {
            const marksArray = Object.keys(marks).map(studentId => ({
                studentId,
                score: marks[studentId] === '' ? 0 : marks[studentId]
            }));

            const { data } = await axios.post(`${backendUrl}/api/tests/${testId}/offline-marks`, {
                marks: marksArray
            });

            if (data.success) {
                toast.success("Marks saved successfully!");
                navigate(`/classroom/${classroomId}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save marks");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!test || test.mode !== 'Offline') {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 px-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Test</h2>
                <button onClick={() => navigate(`/classroom/${classroomId}`)} className="text-gray-900 underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto w-full pt-28 px-4 sm:px-6">

                {/* Header Action Bar */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/classroom/${classroomId}`)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Classroom</span>
                    </button>
                    <button
                        onClick={handleSaveMarks}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Marks'}
                    </button>
                </div>

                {/* Test Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                        <p className="text-gray-500 mt-1">{test.description || 'No description provided.'}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                                Offline Test
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                                Max Marks: {test.maxMarks}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Student Marks Entry</h2>
                        <span className="text-sm text-gray-500 font-medium">Total Students: {students.length}</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {students.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No students enrolled in this classroom yet.
                            </div>
                        ) : (
                            students.map(student => (
                                <div key={student._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                            {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{student.name}</p>
                                            <p className="text-sm text-gray-500">{student.rollno || student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {marks[student._id] !== undefined && marks[student._id] !== '' && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max={test.maxMarks}
                                                value={marks[student._id] !== undefined ? marks[student._id] : ''}
                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                placeholder="0"
                                                className="w-32 text-right pr-14 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 font-medium text-gray-900 placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm pointer-events-none">
                                                / {test.maxMarks}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfflineMarksEntry;
