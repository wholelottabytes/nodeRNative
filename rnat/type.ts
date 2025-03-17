import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Определите типы для параметров каждого экрана
export type RootStackParamList = {
    Login: undefined; // Экран входа, без параметров
    Register: undefined; // Экран регистрации, без параметров
    Main: undefined; // Основной экран, без параметров
    BeatDetails: {
        beat: {
            _id: string;            // Используем _id, так как в ответе от сервера это поле
            imageUrl: string;       // Путь к изображению
            audioUrl: string;       // Путь к аудиофайлу
            title: string;
            author: string;
            price: number;
            description: string;
            tags: string[];
            likes: number;
            user: {
                _id: string;
                username: string;
    };
        };
    }; // Экран с подробным описанием бита
};

// Типы для навигации
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BeatDetails'>;
export type BeatDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BeatDetails'>;

// Тип для route в BeatDetailsScreen
export type BeatDetailsScreenRouteProp = RouteProp<RootStackParamList, 'BeatDetails'>;

// Тип для пропсов BeatDetailsScreen
export type BeatDetailsScreenProps = {
    route: BeatDetailsScreenRouteProp;
    navigation: BeatDetailsScreenNavigationProp;
};
