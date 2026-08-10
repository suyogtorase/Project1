import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { Clock, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const TestTaker = () => {
    const { id: classroomId, testId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userData } = useContext(AppContent);

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showReview, setShowReview] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        if (userData && userData.role === 'Student') {
            fetchTestDetails();
        } else if (userData && userData.role !== 'Student') {
            navigate(`/classroom/${classroomId}`);
        }
    }, [userData, testId]);

    const fetchTestDetails = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(`${backendUrl}/api/tests/${testId}`);
            if (data.success) {
                setTest(data.test);
                if (data.submission) {
                    setAnswers(data.submission.answers || []);
                    if (data.submission.isSubmitted) {
                        setIsSubmitted(true);
                        setScore(data.submission.score);
                    }
                }
                
                if (!data.submission?.isSubmitted) {
                    calculateTimeLeft(data.test);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching test');
            navigate(`/classroom/${classroomId}`);
        } finally {
            setLoading(false);
        }
    };

    const calculateTimeLeft = (testData) => {
        const start = new Date(testData.startTime).getTime();
        const end = start + (testData.durationMinutes * 60000);
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((end - now) / 1000));
            setTimeLeft(remaining);
            
            if (remaining === 0) {
                clearInterval(timerRef.current);
                handleAutoSubmit();
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    const saveProgress = useCallback(async (currentAnswers) => {
        try {
            axios.defaults.withCredentials = true;
            await axios.post(`${backendUrl}/api/tests/${testId}/save-progress`, {
                answers: currentAnswers
            });
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }, [backendUrl, testId]);

    const handleAnswerChange = (questionId, value) => {
        if (isSubmitted) return;

        let newAnswers = [...answers];
        const existingIndex = newAnswers.findIndex(a => a.questionId === questionId);
        
        if (existingIndex >= 0) {
            newAnswers[existingIndex].answer = value;
        } else {
            newAnswers.push({ questionId, answer: value });
        }
        
        setAnswers(newAnswers);

        // Debounce auto-save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveProgress(newAnswers);
        }, 1000);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitted || submitting) return;

        if (!window.confirm("Are you sure you want to submit? You cannot change answers after submission.")) return;
        
        submitTestLogic();
    };

    const handleAutoSubmit = async () => {
        if (isSubmitted || submitting) return;
        toast.info("Time is up! Auto-submitting your test.");
        submitTestLogic();
    };

    const submitTestLogic = async () => {
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/tests/${testId}/submit`, {
                answers: answers
            });

            if (data.success) {
                toast.success("Test submitted successfully!");
                setIsSubmitted(true);
                setScore(data.score);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting test');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!test) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col relative pb-20">
            <Navbar />
            
            {/* Sticky Header */}
            <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40 px-6 py-3 flex justify-between items-center transition-all">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/classroom/${classroomId}`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold truncate max-w-[50%]">{test.title}</h1>
                </div>
                {isSubmitted ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-lg bg-green-100 text-green-700">
                        Score: {score}
                    </div>
                ) : (
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-900'}`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            <div className="max-w-3xl mx-auto w-full pt-36 px-4 sm:px-6">
                
                {/* Test Description */}
                <div className="bg-white border-t-[8px] border-gray-900 rounded-xl shadow-md p-8 mb-6 border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h2>
                    {test.description && <p className="text-gray-600 whitespace-pre-wrap">{test.description}</p>}
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
                        Total Points: {test.questions?.reduce((acc, q) => acc + (q.points || 1), 0)}
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6 mb-8">
                    {test.questions?.map((q, idx) => {
                        const currentAnsObj = answers.find(a => a.questionId === q._id);
                        const currentAns = currentAnsObj ? currentAnsObj.answer : '';

                        return (
                            <div key={q._id} className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 leading-relaxed max-w-[85%]">
                                        <span className="font-bold mr-2">{idx + 1}.</span> 
                                        {q.questionText}
                                    </h3>
                                    <span className="text-sm font-bold text-gray-400 whitespace-nowrap">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                                </div>

                                {q.type === 'Multiple Choice' ? (
                                    <div className="space-y-3 mt-4 ml-6">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = currentAns === opt;
                                            const isCorrect = q.correctAnswer === opt;
                                            const isWrong = isSelected && !isCorrect;
                                            
                                            let bgClass = "bg-white border-gray-300";
                                            if (isSubmitted) {
                                                if (isCorrect) bgClass = "bg-green-50 border-green-500 ring-1 ring-green-500 text-green-700";
                                                else if (isWrong) bgClass = "bg-red-50 border-red-500 ring-1 ring-red-500 text-red-700";
                                                else bgClass = "bg-gray-50 border-gray-200 opacity-60";
                                            }

                                            return (
                                                <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass} ${isSubmitted ? 'cursor-default' : 'cursor-pointer group'}`}>
                                                    <input 
                                                        type="radio"
                                                        name={`question_${q._id}`}
                                                        value={opt}
                                                        checked={isSelected}
                                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-5 h-5 text-gray-900 border-gray-300 focus:ring-gray-900 disabled:opacity-70"
                                                    />
                                                    <span className={`font-medium ${isSubmitted && (isCorrect || isWrong) ? '' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>{opt}</span>
                                                    {isSubmitted && isCorrect && <CheckCircle className="w-5 h-5 ml-auto text-green-500" />}
                                                </label>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <textarea 
                                            value={currentAns}
                                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                            placeholder="Your answer"
                                            rows="3"
                                            disabled={isSubmitted}
                                            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-y ${isSubmitted ? (currentAns.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase() ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'border-gray-300'}`}
                                        />
                                        {isSubmitted && (
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <span className="font-bold text-blue-700 text-sm block mb-1">Correct Answer:</span>
                                                <span className="text-blue-900 whitespace-pre-wrap">{q.correctAnswer}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {!isSubmitted && (
                    <div className="flex justify-end mb-12">
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-70"
                        >
                            <Send className="w-5 h-5" />
                            {submitting ? 'Submitting...' : 'Submit Test'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TestTaker;
