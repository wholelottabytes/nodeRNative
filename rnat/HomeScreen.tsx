import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from './type.ts'; // Импортируем тип

const categories = ['Trending', 'Recent', 'Popular', 'Top'];
const items = [
    {
        id: '1',
        image: require('./assets/1.jpg'),
        title: 'Place a bid',
        author: 'Author1',
        price: 50,
        description: 'This is a great beat!',
        tags: ['Hip-Hop', 'Trap'],
        likes: 120, // Добавляем лайки
        path: 'b',
    },
    {
        id: '2',
        image: require('./assets/2.jpg'),
        title: 'Place a bid',
        author: 'Author2',
        price: 60,
        description: 'Amazing beat for your track!',
        tags: ['Pop', 'EDM'],
        likes: 95,
        path: 'b',
    },
    {
        id: '3',
        image: require('./assets/1.jpg'),
        title: 'Place a bid',
        author: 'Author3',
        price: 70,
        description: 'Perfect beat for rap!',
        tags: ['Rap', 'Drill'],
        likes: 150,
        path: 'b',
    },
    {
        id: '4',
        image: require('./assets/2.jpg'),
        title: 'Place a bid',
        author: 'Author4',
        price: 80,
        description: 'Chill beat for your mood!',
        tags: ['Lo-fi', 'Chill'],
        likes: 200,
        path: 'b',
    },
];

const HomeScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Trending');
    const navigation = useNavigation<HomeScreenNavigationProp>(); // Используем тип

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
                <FlatList
                    data={items}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('BeatDetails', { beat: item })}>
                            <ImageBackground source={item.image} style={styles.card}>
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>{item.title} →</Text>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    )}
                />
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
