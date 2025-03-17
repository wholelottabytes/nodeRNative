import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Определяем типы для контекста
interface User {
    username: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
}

// Начальное значение контекста
const initialAuthContext: AuthContextType = {
    isAuthenticated: false,
    user: null,
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
    const [user, setUser] = useState<User | null>(null);

    // Проверка авторизации при запуске
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (token && storedUser) {
                setIsAuthenticated(true);
                setUser(JSON.parse(storedUser));
            }
        };
        checkAuth();
    }, []);

    // Вход
    const login = async (token: string, user: User) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        setIsAuthenticated(true);
        setUser(user);
    };

    // Выход
    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');

        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
