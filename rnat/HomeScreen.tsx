import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';

const categories = ['Trending', 'Recent', 'Popular', 'Top'];
const items = [
    { id: '1', image: require('./assets/1.jpg'), title: 'Place a bid' },
    { id: '2', image: require('./assets/2.jpg'), title: 'Place a bid' },
    { id: '3', image: require('./assets/1.jpg'), title: 'Place a bid' },
    { id: '4', image: require('./assets/2.jpg'), title: 'Place a bid' },

];

const HomeScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Trending');

    return (
        <View style={styles.container}>
            {/* Заголовок */}
            <Text style={styles.header}>Explore collections</Text>

            {/* Поле поиска */}
            <TextInput style={styles.searchInput} placeholder="Search"  placeholderTextColor="grey" />

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
                        <ImageBackground source={item.image} style={styles.card}>
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText}>{item.title} →</Text>
                            </TouchableOpacity>
                        </ImageBackground>
                    )}
                />
            </View>
            <Text style={styles.header}>The most popular</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    featuredList: {height: 250},
    categoryList: {height: 50},
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', color: 'black' },
    searchInput: { backgroundColor: '#f2f2f2', padding: 10, borderRadius: 10, marginVertical: 10, color: 'black'  },
    tab: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginRight: 10, height: 50 },
    activeTab: { backgroundColor: 'black' },
    tabText: { fontSize: 16, color: '#666' },
    activeTabText: { color: 'white' },
    card: { width: 200, height: 200, margin: 10, justifyContent: 'flex-end', padding: 10, overflow: 'hidden', borderRadius: 30 },
    button: { backgroundColor: '#fff', padding: 8, borderRadius: 8 },
    buttonText: { fontWeight: 'bold' },
});

export default HomeScreen;
