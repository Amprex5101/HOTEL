import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import axios from 'axios';

// Usar la variable de entorno para la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                const token = authService.getToken();
                
                if (currentUser && token) {
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const data = await authService.login(username, password);
            setUser(data.user);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const register = async (username, password, name, email) => {
        try {
            setError(null);
            // Usar la variable de entorno en lugar de la URL hardcodeada
            const response = await axios.post(`${API_BASE_URL}/register`, {
                username,
                password,
                name,
                email
            });
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar el usuario');
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setLoading(false);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};