import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './AuthContext.tsx';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import { View, Text } from 'react-native';

// Создаём стековый навигатор
const Stack = createNativeStackNavigator();

// Создаём нижний таб-навигатор
const Tab = createBottomTabNavigator();

// Заглушки для экранов
const PlaceholderScreen = ({ title }: { title: string }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{title}</Text>
    </View>
);

// Основной таб-навигатор
const MainTabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Categories" component={() => <PlaceholderScreen title="Categories" />} />
        <Tab.Screen name="Add" component={() => <PlaceholderScreen title="Add" />} />
        <Tab.Screen name="Favorites" component={() => <PlaceholderScreen title="Favorites" />} />
        <Tab.Screen name="Profile" component={() => <PlaceholderScreen title="Profile" />} />
    </Tab.Navigator>
);

// Основной компонент приложения
const AppContent = () => {
    const authContext = React.useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext не был предоставлен');
    }

    const { isAuthenticated } = authContext;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    // Если пользователь авторизован, показываем основной интерфейс
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    // Если не авторизован, показываем экраны входа и регистрации
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// Обёртка для AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
