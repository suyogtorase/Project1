import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { ArrowLeft, Users, Key, Save, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const TestResults = () => {
    const { id: classroomId, testId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData } = useContext(AppContent);

    const [test, setTest] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // For updating answers
    const [updatingQuestionId, setUpdatingQuestionId] = useState(null);
    const [newAnswer, setNewAnswer] = useState({});

    useEffect(() => {
        if (userData && userData.role === 'Teacher') {
            fetchData();
        } else if (userData && userData.role !== 'Teacher') {
            navigate(`/classroom/${classroomId}`);
        }
    }, [userData, testId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            axios.defaults.withCredentials = true;
            
            const [testRes, resultsRes] = await Promise.all([
                axios.get(`${backendUrl}/api/tests/${testId}`),
                axios.get(`${backendUrl}/api/tests/${testId}/results`)
            ]);

            if (testRes.data.success) {
                setTest(testRes.data.test);
                
                // Initialize local state for editing answers
                const ansState = {};
                testRes.data.test.questions.forEach(q => {
                    ansState[q._id] = q.correctAnswer;
                });
                setNewAnswer(ansState);
            }

            if (resultsRes.data.success) {
                setResults(resultsRes.data.results);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAnswer = async (questionId) => {
        if (!newAnswer[questionId].trim()) {
            toast.error("Answer cannot be empty");
            return;
        }

        setUpdatingQuestionId(questionId);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.put(`${backendUrl}/api/tests/${testId}/update-answer`, {
                questionId,
                newCorrectAnswer: newAnswer[questionId]
            });

            if (data.success) {
                toast.success(data.message);
                // Re-fetch to get updated scores and test data
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating answer');
        } finally {
            setUpdatingQuestionId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!test) return null;

    const totalPoints = test.questions?.reduce((acc, q) => acc + (q.points || 1), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative pb-20">
            <Navbar />
            
            <div className="max-w-7xl mx-auto w-full pt-28 px-4 sm:px-6">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/classroom/${classroomId}`)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Classroom</span>
                    </button>
                </div>

                <div className="bg-white border-t-[8px] border-gray-900 rounded-xl shadow-md p-8 mb-8 border border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title} - Results</h1>
                    <p className="text-gray-500">View student marks and manage answer keys.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Col: Student Scores */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
                                <Users className="h-5 w-5 text-gray-900" />
                                Student Scores ({results.length})
                            </h2>

                            {results.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="p-4 text-sm font-semibold text-gray-700">Roll No</th>
                                                <th className="p-4 text-sm font-semibold text-gray-700">Name</th>
                                                <th className="p-4 text-sm font-semibold text-gray-700 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((res) => (
                                                <tr key={res.submissionId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-sm font-medium text-gray-600">
                                                        {res.student?.rollno || "-"}
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-gray-900">
                                                        {res.student?.name || "Unknown"}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-900 font-bold text-sm">
                                                            {res.score} / {totalPoints}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                    <p className="text-gray-500">No submissions yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Answer Keys */}
                    <div className="w-full lg:w-[450px] space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Key className="h-5 w-5 text-gray-900" />
                                Answer Keys
                            </h2>
                            <p className="text-xs text-gray-500 mb-6 border-b border-gray-200 pb-4">
                                Update the correct answer for any question. All submitted tests will be automatically re-graded based on the new answer.
                            </p>

                            <div className="space-y-6">
                                {test.questions?.map((q, idx) => (
                                    <div key={q._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-gray-300 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-sm font-bold text-gray-900 leading-tight pr-4">
                                                {idx + 1}. {q.questionText}
                                            </p>
                                            <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded whitespace-nowrap">
                                                {q.points} pt
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 font-medium mb-1 block">Correct Answer</label>
                                                {q.type === 'Multiple Choice' ? (
                                                    <select 
                                                        value={newAnswer[q._id]}
                                                        onChange={(e) => setNewAnswer({...newAnswer, [q._id]: e.target.value})}
                                                        className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-gray-900 bg-white"
                                                    >
                                                        {q.options.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input 
                                                        type="text"
                                                        value={newAnswer[q._id]}
                                                        onChange={(e) => setNewAnswer({...newAnswer, [q._id]: e.target.value})}
                                                        className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-gray-900"
                                                    />
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateAnswer(q._id)}
                                                disabled={updatingQuestionId === q._id || newAnswer[q._id] === q.correctAnswer}
                                                className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                                title="Save & Re-grade"
                                            >
                                                {updatingQuestionId === q._id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TestResults;
