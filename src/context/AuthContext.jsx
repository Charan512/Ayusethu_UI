import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom

// --- API Client Setup ---
// Uses the environment variable you set in Vercel: REACT_APP_API_BASE
const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

// 3. Provider Component
export const AuthContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- EFFECT: Load Token & User from Local Storage on Mount ---
    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setIsAuthenticated(true);
                // Set the default Authorization header for ALL subsequent requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (e) {
                console.error("Failed to parse user data from storage:", e);
                localStorage.clear();
            }
        }
        setIsLoading(false);
    }, []);

    // --- LOGIN Functionality ---
    const login = async ({ email, password, role }) => {
        setIsLoading(true);
        try {
            const response = await publicApi.post('/auth/login', { email, password, role });
            
            const newToken = response.data.access_token;
            const userData = response.data.user;

            // 1. Update State
            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);
            
            // 2. Update Local Storage
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // 3. Set API Header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            navigate(`/${role.toLowerCase()}-dashboard`); // Redirect upon successful login

        } catch (error) {
            console.error("Login failed:", error);
            // Re-throw to allow component to handle specific errors (e.g., display error message)
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGOUT Functionality ---
    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login'); // Redirect to login page
    };

    // --- CONTEXT VALUE ---
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
            {/* Don't render children until the token check is complete */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};