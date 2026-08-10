import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import Navbar from '../components/Navbar';

const TestBuilder = () => {
    const { id: classroomId } = useParams();
    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContent);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [mode, setMode] = useState('Online');
    const [maxMarks, setMaxMarks] = useState(0);
    const [questions, setQuestions] = useState([
        { id: Date.now(), questionText: '', type: 'Multiple Choice', options: ['Option 1'], correctAnswer: '', points: 1 }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { id: Date.now(), questionText: '', type: 'Multiple Choice', options: ['Option 1'], correctAnswer: '', points: 1 }
        ]);
    };

    const handleRemoveQuestion = (id) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleAddOption = (questionId) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
            }
            return q;
        }));
    };

    const handleRemoveOption = (questionId, optionIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleOptionChange = (questionId, optionIndex, value) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleSaveTest = async () => {
        if (!title.trim() || !startTime) {
            toast.error("Please fill in title and start time.");
            return;
        }

        if (mode === 'Online' && !durationMinutes) {
            toast.error("Please fill in duration.");
            return;
        }

        if (mode === 'Offline' && maxMarks <= 0) {
            toast.error("Please specify maximum marks for the offline test.");
            return;
        }

        // Validation
        if (mode === 'Online') {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.questionText.trim()) {
                    toast.error(`Question ${i + 1} is missing text.`);
                    return;
                }
                if (q.type === 'Multiple Choice' && q.options.length < 2) {
                    toast.error(`Question ${i + 1} needs at least 2 options.`);
                    return;
                }
                if (!q.correctAnswer.trim()) {
                    toast.error(`Question ${i + 1} is missing a correct answer.`);
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/tests/create`, {
                classroomId,
                title,
                description,
                mode,
                maxMarks,
                startTime,
                durationMinutes,
                questions: mode === 'Online' ? questions.map(({ id, ...rest }) => rest) : []
            });

            if (data.success) {
                toast.success("Test created successfully!");
                navigate(`/classroom/${classroomId}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating test');
        } finally {
            setIsSaving(false);
        }
    };

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
                        <span className="font-medium">Back</span>
                    </button>
                    <button 
                        onClick={handleSaveTest}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>

                {/* Form Header (Title & Description) */}
                <div className="bg-white border-t-[8px] border-gray-900 rounded-xl shadow-md p-8 mb-6 transition-all hover:shadow-lg">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Test Title"
                        className="w-full text-4xl font-bold text-gray-900 border-none focus:ring-0 px-0 border-b border-transparent focus:border-gray-300 pb-2 mb-4 placeholder-gray-300 bg-transparent"
                    />
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Test Description (optional)"
                        rows={2}
                        className="w-full text-gray-600 border-none focus:ring-0 px-0 border-b border-transparent focus:border-gray-300 resize-none placeholder-gray-400 bg-transparent"
                    />
                </div>

                {/* Test Settings */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Test Settings</h3>
                    
                    <div className="mb-6 flex gap-4">
                        <button
                            onClick={() => setMode('Online')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${mode === 'Online' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            Online Test
                        </button>
                        <button
                            onClick={() => setMode('Offline')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors border ${mode === 'Offline' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            Offline Test
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input 
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                            />
                        </div>
                        {mode === 'Online' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Marks</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={maxMarks}
                                    onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {mode === 'Online' && (
                <>
                <div className="space-y-6">
                    {/* Questions List */}
                    {questions.map((q, qIndex) => (
                        <div key={q.id} className="bg-white rounded-xl shadow-md flex border border-gray-200 overflow-hidden relative group">
                            
                            {/* Left Grip Handle */}
                            <div className="w-8 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-center text-gray-300 group-hover:text-gray-400 cursor-move">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="flex-1 p-6">
                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <input 
                                        type="text"
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                                        placeholder={`Question ${qIndex + 1}`}
                                        className="flex-1 bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white rounded-lg px-4 py-3 text-lg font-medium focus:outline-none focus:ring-0 transition-colors"
                                    />
                                    <select 
                                        value={q.type}
                                        onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                        className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-gray-900"
                                    >
                                        <option value="Multiple Choice">Multiple Choice</option>
                                        <option value="Short Answer">Short Answer</option>
                                    </select>
                                </div>

                                {/* Options area */}
                                {q.type === 'Multiple Choice' && (
                                    <div className="space-y-3 mb-6 pl-2">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                <input 
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                                                    className="flex-1 border-none focus:ring-0 border-b border-transparent focus:border-gray-300 px-0 py-1"
                                                />
                                                <button 
                                                    onClick={() => handleRemoveOption(q.id, optIndex)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-3 mt-2 text-sm">
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                            <button 
                                                onClick={() => handleAddOption(q.id)}
                                                className="text-gray-500 hover:text-gray-900 hover:underline"
                                            >
                                                Add option
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {q.type === 'Short Answer' && (
                                    <div className="mb-6 pl-2">
                                        <div className="border-b border-gray-300 border-dashed pb-2 w-1/2 text-gray-400">
                                            Short answer text
                                        </div>
                                    </div>
                                )}

                                {/* Question Settings Footer */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-500">Points:</label>
                                            <input 
                                                type="number"
                                                min="0"
                                                value={q.points}
                                                onChange={(e) => handleQuestionChange(q.id, 'points', parseInt(e.target.value) || 0)}
                                                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-gray-900"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-500 font-bold">Correct Answer:</label>
                                            <input 
                                                type="text"
                                                value={q.correctAnswer}
                                                onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                                                placeholder={q.type === 'Multiple Choice' ? "Exact Option Text" : "Expected Answer"}
                                                className="w-48 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-gray-900"
                                            />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleRemoveQuestion(q.id)}
                                        disabled={questions.length === 1}
                                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors p-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Add Question Button */}
                <div className="flex justify-center mt-8 mb-12">
                    <button 
                        onClick={handleAddQuestion}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-900 rounded-full font-bold shadow-sm transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        Add Question
                    </button>
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default TestBuilder;
