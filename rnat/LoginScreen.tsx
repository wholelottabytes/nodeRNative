import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { LoginScreenNavigationProp } from './type.ts';
import config from './config';

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext не был предоставлен');
    }

    const { login, user, isAuthenticated } = authContext;

    const handleLogin = async () => {
        const formattedUsername = username.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!formattedUsername || !trimmedPassword) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        if (trimmedPassword.length < 6) {
            Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`http://${config.serverIP}:5000/auth/login`, { 
                username: formattedUsername, 
                password: trimmedPassword 
            });

            const { token, user } = response.data; // Получаем данные из ответа
            console.log('User при входе:', user);
            await login(token, user); // Передаем user в AuthContext

            Alert.alert('Успешный вход!', `Добро пожаловать, ${user.username}`);
        } catch (error: any) {
            console.log(error); 
            if (error.response) {
                Alert.alert('Ошибка входа', error.response.data.message || 'Неверные данные');
            } else if (error.request) {
                Alert.alert('Ошибка', 'Проблемы с сервером, попробуйте позже');
            } else {
                Alert.alert('Ошибка', 'Неизвестная ошибка, попробуйте снова');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {isAuthenticated ? (
                <Text style={styles.welcomeText}>Добро пожаловать, {user?.username}!</Text>
            ) : (
                <>
                    <Text style={styles.label}>Имя пользователя:</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Введите имя пользователя"
                        autoCapitalize="none"
                    />
                    <Text style={styles.label}>Пароль:</Text>
                    <TextInput
                        style={styles.input}
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
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderBottomWidth: 1,
        marginBottom: 15,
        paddingVertical: 5,
        fontSize: 16,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default LoginScreen;
