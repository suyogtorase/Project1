import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { Building, Plus, Users } from 'lucide-react';

const InstitutePanel = () => {
    const { backendUrl, userData, getUserData } = useContext(AppContent);
    const [instituteName, setInstituteName] = useState('');
    const [location, setLocation] = useState('');
    const [className, setClassName] = useState('');
    const [classLevel, setClassLevel] = useState('');
    const [targetUserId, setTargetUserId] = useState('');

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

    if (userData?.role !== 'Administrator') return null;

    return (
        <div className="p-6 bg-[#2a2a3e] border border-gray-700 rounded-xl">
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
                        <form onSubmit={handleCreateClassroom} className="space-y-3">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Create Classroom
                            </h4>
                            <input
                                type="text"
                                placeholder="Classroom Name"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Level (e.g., High School)"
                                value={classLevel}
                                onChange={(e) => setClassLevel(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                            />
                            <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] text-white rounded-lg text-sm font-medium hover:opacity-90">
                                Create
                            </button>
                        </form>

                        {/* Assign User */}
                        <form onSubmit={handleAssignUser} className="space-y-3">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Users className="h-4 w-4" /> Assign User
                            </h4>
                            <p className="text-xs text-gray-400">Assign a teacher or student to your institute by their User ID.</p>
                            <input
                                type="text"
                                placeholder="User ID"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm focus:border-[#8b7cf6] outline-none"
                            />
                            <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] text-white rounded-lg text-sm font-medium hover:opacity-90">
                                Assign
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default InstitutePanel;
