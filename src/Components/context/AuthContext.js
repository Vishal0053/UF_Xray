// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // Or false if you just need a boolean

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ideally, fetch user data using the token and set it to currentUser
            // For now, let's assume the token itself means the user is logged in
            setCurrentUser(true); // Or set the fetched user data
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        // Ideally, fetch user data and set it to currentUser
        setCurrentUser(true); // Or set the fetched user data
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null); // Or false
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};