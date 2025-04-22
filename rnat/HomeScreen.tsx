import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from './type.ts';
import { Image } from 'react-native';
import config from './config';

interface Beat {
    _id: string;
    imageUrl: string;
    audioUrl: string;
    title: string;
    author: string;
    price: number;
    description: string;
    tags: string[];
    user: {
        _id: string;
        username: string;
    };
    createdAt: string;
    averageRating?: number;
    ratingsCount?: number;
}

const categories = ['Day', 'Month', 'Year'];

const HomeScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Month');
    const [beats, setBeats] = useState<Beat[]>([]);
    const [popularBeats, setPopularBeats] = useState<Beat[]>([]);
    const navigation = useNavigation<HomeScreenNavigationProp>();

    useEffect(() => {
        fetch(`http://${config.serverIP}:5000/beats/`)
            .then((response) => response.json())
            .then((data) => setBeats(data))
            .catch((error) => {
                console.error('Ошибка при получении битов:', error);
            });
    }, []);

    useEffect(() => {
        fetchPopularBeats(selectedCategory.toLowerCase());
    }, [selectedCategory]);

    const fetchPopularBeats = async (period: string) => {
        try {
            const response = await fetch(`http://${config.serverIP}:5000/beats/popular/${period}`);
            const data = await response.json();
            setPopularBeats(data);
        } catch (error) {
            console.error('Ошибка при получении популярных битов:', error);
        }
    };

    const renderPopularBeat = ({ item }: { item: Beat }) => (
        <TouchableOpacity 
            style={styles.popularBeatCard}
            onPress={() => navigation.navigate('BeatDetails', { beat: item })}
        >
            <Image 
                source={{ uri: `http://${config.serverIP}:5000/${item.imageUrl}` }} 
                style={styles.popularBeatImage}
            />
            <View style={styles.popularBeatInfo}>
                <Text style={styles.popularBeatTitle}>{item.title}</Text>
                <Text style={styles.popularBeatAuthor}>by {item.user.username}</Text>
                <View style={styles.popularBeatStats}>
                    <Text style={styles.popularBeatRating}>
                        ⭐ {item.averageRating?.toFixed(1) || 'N/A'} ({item.ratingsCount || 0})
                    </Text>
                    <Text style={styles.popularBeatPrice}>${item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Explore collections</Text>
            <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="grey" />
            
            <Text style={styles.header}>Recent</Text>
            <View style={styles.featuredList}>
                {beats.length > 0 ? (
                    <FlatList
                        data={beats}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => navigation.navigate('BeatDetails', { beat: item })}>
                                <Image 
                                    source={{ uri: `http://${config.serverIP}:5000/${item.imageUrl}` }} 
                                    style={styles.card}
                                /> 
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
            <View style={styles.categoryList}>
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
                            <Text style={[styles.tabText, selectedCategory === item && styles.activeTabText]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
            
            <FlatList
                data={popularBeats}
                keyExtractor={(item) => item._id}
                renderItem={renderPopularBeat}
                contentContainerStyle={styles.popularList}
                ListEmptyComponent={<Text style={styles.loadingText}>Loading popular beats...</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 10 },
    searchInput: { 
        backgroundColor: '#f2f2f2', 
        padding: 10, 
        borderRadius: 10, 
        marginVertical: 10, 
        color: 'black' 
    },
    featuredList: { height: 250 },
    categoryList: { height: 50, marginBottom: 10 },
    tab: { 
        paddingVertical: 8, 
        paddingHorizontal: 15, 
        borderRadius: 20, 
        marginRight: 10, 
        backgroundColor: '#f2f2f2' 
    },
    activeTab: { backgroundColor: 'black' },
    tabText: { fontSize: 16, color: '#666' },
    activeTabText: { color: 'white' },
    card: { 
        width: 200, 
        height: 200, 
        margin: 10, 
        justifyContent: 'flex-end', 
        padding: 10, 
        overflow: 'hidden', 
        borderRadius: 30 
    },
    button: { 
        backgroundColor: '#fff', 
        padding: 8, 
        borderRadius: 8,
        marginTop: 5 
    },
    buttonText: { fontWeight: 'bold' },
    popularList: {
        paddingBottom: 20,
    },
    popularBeatCard: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        alignItems: 'center',
    },
    popularBeatImage: {
        width: 80,
        height: 80,
        borderRadius: 15,
    },
    popularBeatInfo: {
        flex: 1,
        padding: 15,
    },
    popularBeatTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    popularBeatAuthor: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    popularBeatStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    popularBeatRating: {
        fontSize: 14,
        color: '#FFD700',
    },
    popularBeatPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});

export default HomeScreen;