import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LoginScreenNavigationProp } from './type.ts'; // Импортируйте типы
import { AuthContext } from './AuthContext'; // Импортируем AuthContext

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Используем контекст
    const authContext = useContext(AuthContext);

    // Проверяем, что контекст не null
    if (!authContext) {
        throw new Error('AuthContext не был предоставлен');
    }

    // Деструктурируем нужные методы из контекста
    const { login } = authContext;

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://192.168.8.12:5000/auth/login', { username, password });
            await AsyncStorage.setItem('token', response.data.token);
            await login(response.data.token); // Используем метод login из контекста
            Alert.alert('Успешный вход!');
        } catch (error: any) {
            if (error.response) {
                Alert.alert('Ошибка входа', error.response.data.message || 'Попробуйте снова');
            } else if (error.request) {
                Alert.alert('Ошибка', 'Сервер недоступен. Проверьте подключение к интернету');
            } else {
                Alert.alert('Ошибка', 'Что-то пошло не так');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Text>Имя пользователя:</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
                value={username}
                onChangeText={setUsername}
                placeholder="Введите имя пользователя"
            />
            <Text>Пароль:</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Button title="Войти" onPress={handleLogin} />
                    <Button title="Регистрация" onPress={() => navigation.navigate('Register')} />
                </>
            )}
        </View>
    );
};

export default LoginScreen;
