import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContent = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/auth/is-auth", {
                withCredentials: true,
            });

            if (data.success) {
                setIsLoggedIn(true);
                getUserData();
            } 
            else {
                setIsLoggedIn(false);
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


    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-data', {
                withCredentials: true,
            });

            data.success ? setUserData(data.UserData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getAuthState();
    }, [])

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}