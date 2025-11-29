import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import assets2 from '../assets2/assets2';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
    const navigate = useNavigate();
    const { onlineUsers, socket } = useContext(AppContent);
    const [users, setUsers] = useState([]);
    const [unseenMap, setUnseenMap] = useState({});
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/messages/users');
            if (data.success) {
                setUsers(data.users);
                setUnseenMap(data.unseenMessages || {});
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if(!socket) return;
        const refreshUsers = () => fetchUsers();
        socket.on('newMessage', refreshUsers);
        return () => {
            socket.off('newMessage', refreshUsers);
        }
    }, [socket, fetchUsers]);

    useEffect(() => {
        if(selectedUser?._id){
            fetchUsers();
        }
    }, [selectedUser?._id, fetchUsers]);

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        return users.filter((user) =>
            user.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                    <img src={assets2.logo} alt="logo" className='max-w-40' />
                    <div className='relative py-2 group'>
                        <img src={assets2.menu_icon} alt="menu" className='max-h-5 cursor-pointer' />
                        <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border 
                                        border-gray-600 text-gray-100 hidden group-hover:block'>
                            <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                            <hr className='my-2 border-t border-gray-500' />
                            <p className='cursor-pointer text-sm'>Logout</p>
                        </div>
                    </div>
                </div>

                <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
                    <img src={assets2.search_icon} alt="search" className='w-3' />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1'
                        placeholder='Search User...' />
                </div>

            </div>

            <div className='flex flex-col gap-2'>
                {isLoading && <p className='text-xs text-gray-300 py-4 text-center'>Loading users...</p>}
                {!isLoading && filteredUsers.length === 0 && (
                    <p className='text-xs text-gray-300 py-4 text-center'>No users found</p>
                )}
                {filteredUsers.map((user) => {
                    const isOnline = onlineUsers.includes(user._id);
                    const unseenCount = unseenMap[user._id];
                    return (
                        <div
                            key={user._id}
                            onClick={() => { setSelectedUser(user) }}
                            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm transition-colors
                        ${selectedUser?._id === user._id ? 'bg-[#282142]/70' : 'hover:bg-[#282142]/40'}`}>

                            <img src={user?.profilePic || assets2.avatar_icon} alt="user Profile"
                                className='w-[35px] aspect-[1/1] rounded-full object-cover' />
                            <div className='flex flex-col leading-5 flex-1'>
                                <p className='font-medium'>{user.name}</p>
                                <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-neutral-400'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            {unseenCount && unseenCount > 0 && (
                                <p className='text-xs h-5 min-w-5 px-1 flex justify-center items-center rounded-full bg-violet-500/70'>
                                    {unseenCount}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Sidebar;
