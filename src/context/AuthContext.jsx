import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const AuthContextProvider = ({ children, navigate }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token'); 
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setIsAuthenticated(true);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (e) {
                console.error("Failed to parse user data from storage:", e);
                localStorage.clear();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async ({ email, password, role }) => {
        setIsLoading(true);
        console.log("🔑 Login attempt:", { email, role });

        try {
            const cleanedBaseUrl = import.meta.env.VITE_API_BASE.replace(/\/$/, '');
            const LOGIN_URL = `${cleanedBaseUrl}/api/auth/login`; 
    
            const response = await axios.post(LOGIN_URL, { email, password, role });        
            const newToken = response.data.access_token;
            const userData = response.data.user;

            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);
            
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // Use the navigate callback passed as prop
            if (navigate) {
                if (role === 'Admin') {
                    navigate('/admin');
                } else if (role === 'Tester') {
                    navigate('/labtest');
                } else {
                    navigate(`/${role.toLowerCase()}`);
                }
            }
            
        } catch (error) {
            console.error("Login failed:", error);
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};