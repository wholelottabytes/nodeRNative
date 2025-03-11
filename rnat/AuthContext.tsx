import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Определяем типы для контекста
interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Начальное значение контекста
const initialAuthContext: AuthContextType = {
    isAuthenticated: false,
    login: async () => {},
    logout: async () => {},
};

// Создаём контекст с начальным значением
export const AuthContext = createContext<AuthContextType>(initialAuthContext);

// Пропсы для провайдера
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Проверка авторизации при запуске
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
            }
        };
        checkAuth();
    }, []);

    // Вход
    const login = async (token: string) => {
        await AsyncStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    // Выход
    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
