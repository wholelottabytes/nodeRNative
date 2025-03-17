import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from './type.ts'; // Импортируем тип
import { Image } from 'react-native';

// Определяем тип для битов
interface Beat {
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
}


const categories = ['Trending', 'Recent', 'Popular', 'Top'];

const HomeScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Trending');
    const [beats, setBeats] = useState<Beat[]>([]); // Указываем тип данных в состоянии
    const navigation = useNavigation<HomeScreenNavigationProp>(); // Используем тип

    useEffect(() => {
        console.log('useEffect started');
        fetch('http://192.168.8.12:5000/beats/')
            .then((response) => {
                console.log('Response received');
                return response.json();
            })
            .then((data) => {
                console.log('Data parsed');
                setBeats(data);
                console.log(data);
            })
            .catch((error) => {
                console.error('Ошибка при получении битов:', error);
            });
    }, []);

    return (
        <View style={styles.container}>
            {/* Заголовок */}
            <Text style={styles.header}>Explore collections</Text>

            {/* Поле поиска */}
            <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="grey" />

            <View style={styles.categoryList}>
                {/* Табы */}
                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.tab, selectedCategory === item && styles.activeTab]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[styles.tabText, selectedCategory === item && styles.activeTabText]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <Text style={styles.header}>Featured items</Text>
            {/* Featured Items */}
            <View style={styles.featuredList}>
                
            {beats.length > 0 ? (
                <FlatList
                    data={beats}  // Используем полученные данные
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('BeatDetails', { beat: item })}>
                            <Image source={{ uri: `http://192.168.8.12:5000/${item.imageUrl}` }} style={styles.card}></Image> 
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>{item.title} →</Text>
                                </View>
                                
                                
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text>Загрузка...</Text>
            )}
            </View>
            <Text style={styles.header}>The most popular</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    featuredList: { height: 250 },
    categoryList: { height: 50 },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', color: 'black' },
    searchInput: { backgroundColor: '#f2f2f2', padding: 10, borderRadius: 10, marginVertical: 10, color: 'black' },
    tab: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, height: 50 },
    activeTab: { backgroundColor: 'black' },
    tabText: { fontSize: 16, color: '#666' },
    activeTabText: { color: 'white' },
    card: { width: 200, height: 200, margin: 10, justifyContent: 'flex-end', padding: 10, overflow: 'hidden', borderRadius: 30 },
    button: { backgroundColor: '#fff', padding: 8, borderRadius: 8 },
    buttonText: { fontWeight: 'bold' },
});

export default HomeScreen;