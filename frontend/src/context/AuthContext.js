import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Lo crearemos después, pero lo referenciamos ya

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para saber si estamos verificando el estado de auth inicial

    useEffect(() => {
        // Intentar cargar el usuario si hay un token al iniciar la app
        const loadUserFromToken = async () => {
            const token = localStorage.getItem('token'); // O leer desde cookie si se configuró así en el backend
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch (err) {
                    console.error("Error al cargar usuario desde token:", err);
                    localStorage.removeItem('token'); // Token inválido o expirado
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUserFromToken();
    }, []);

    const login = async (userData, token) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const register = async (userData, token) => {
        // Similar al login, pero podrías querer manejarlo diferente
        // Por ejemplo, algunos sistemas no auto-loguean después de registrar.
        // Aquí asumimos que sí y que el backend devuelve user y token.
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        // Opcional: llamar al endpoint de logout del backend para invalidar la cookie HttpOnly si se usa
        // try {
        //    api.post('/auth/logout');
        // } catch (err) {
        //    console.error("Error en logout del backend:", err);
        // }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
