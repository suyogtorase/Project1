import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        axios.defaults.baseURL = backendUrl;
        axios.defaults.withCredentials = true;
    }, [backendUrl]);

    const getAuthState = async () => {
        try {
            const { data } = await axios.get("/api/auth/is-auth");

            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
            } 
            else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setIsLoggedIn(false);
            } 
            else {
                toast.error(error.response?.data?.message || error.message);
            }
        }
    };

    const getAdminAuthState = async () => {
        try {
            const { data } = await axios.get("/api/auth/admin-auth");

            if (data.success) {
                setIsAdminLoggedIn(true);
                getAdminData();
            } 
            else {
                setIsAdminLoggedIn(false);
                setAdminData(null);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setIsAdminLoggedIn(false);
            } 
            else {
                toast.error(error.response?.data?.message || error.message);
            }
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get('/api/user/get-data');

            if (data.success) {
                setUserData(data.UserData);
                return data.UserData;
            }
            setUserData(null);
            toast.error(data.message);
        } catch (error) {
            setUserData(null);
            toast.error(error.message);
        }
    }

    const getAdminData = async () => {
        try {
            const { data } = await axios.get('/api/admin/get-admin-data');

            if(data.success){
                setAdminData(data.admin)
            } else {
                setAdminData(null)
                toast.error(data.message)
            }
        } catch (error) {
            setAdminData(null)
            // toast.error(error.message)
        }
    }

    useEffect(() => {
        if (!userData?.userId) return;

        const newSocket = io(backendUrl, {
            query: { userId: userData.userId },
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        return () => {
            newSocket.disconnect();
        }
    }, [backendUrl, userData?.userId]);

    useEffect(() => {
        getAuthState();
    }, [])

    useEffect(() => {
        getAdminAuthState();
    }, [])

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        isAdminLoggedIn, setIsAdminLoggedIn,
        getUserData,
        getAdminData,
        adminData,
        socket,
        onlineUsers,
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}