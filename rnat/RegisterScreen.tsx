import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { RegisterScreenNavigationProp } from './type.ts'; // Импортируйте типы

interface Props {
    navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post('http://192.168.8.12:5000/auth/register', { username, password });
            Alert.alert('Регистрация успешна!');
            navigation.navigate('Login');
        } catch (error: any) {
            if (error.response) {
                Alert.alert('Ошибка', error.response.data.message || 'Попробуйте снова');
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
                    <Button title="Зарегистрироваться" onPress={handleRegister} />
                    <Button title="Назад ко входу" onPress={() => navigation.navigate('Login')} />
                </>
            )}
        </View>
    );
};

export default RegisterScreen;
