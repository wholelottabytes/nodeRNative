import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from './type.ts';
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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      // Fetch recent beats
      const beatsResponse = await fetch(`http://${config.serverIP}:5000/beats/`);
      const beatsData = await beatsResponse.json();
      setBeats(beatsData);
      
      // Fetch popular beats
      const popularResponse = await fetch(`http://${config.serverIP}:5000/beats/popular/${selectedCategory.toLowerCase()}`);
      const popularData = await popularResponse.json();
      setPopularBeats(popularData);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const renderRecentBeat = ({ item }: { item: Beat }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('BeatDetails', { beat: item })}
      style={styles.recentBeatContainer}
    >
      <Image 
        source={{ uri: `http://${config.serverIP}:5000/${item.imageUrl}` }} 
        style={styles.recentBeatImage}
      /> 
      <View style={styles.recentBeatButton}>
        <Text style={styles.recentBeatButtonText}>{item.title} →</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            tintColor="#000"
          />
        }
      >
        <View style={styles.container}>
          <Text style={styles.header}>Explore beats</Text>
          
          <Text style={styles.sectionHeader}>Recent</Text>
          <FlatList
            data={beats}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={renderRecentBeat}
            contentContainerStyle={styles.recentList}
            ListEmptyComponent={<Text style={styles.emptyText}>No recent beats found</Text>}
          />
          
          <Text style={styles.sectionHeader}>The most popular</Text>
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
            contentContainerStyle={styles.categoryList}
          />
          
          <FlatList
            data={popularBeats}
            keyExtractor={(item) => item._id}
            renderItem={renderPopularBeat}
            contentContainerStyle={styles.popularList}
            ListEmptyComponent={<Text style={styles.emptyText}>No popular beats found</Text>}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
    marginTop: 20,
  },
  recentList: {
    paddingBottom: 10,
  },
  recentBeatContainer: {
    marginRight: 15,
  },
  recentBeatImage: {
    width: 200,
    height: 200,
    borderRadius: 30,
  },
  recentBeatButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  recentBeatButtonText: {
    fontWeight: 'bold',
  },
  categoryList: {
    paddingBottom: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f2f2f2',
  },
  activeTab: {
    backgroundColor: 'black',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
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
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});

export default HomeScreen;