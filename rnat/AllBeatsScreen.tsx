import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from './type.ts';
import config from './config';

interface Beat {
  _id: string;
  imageUrl: string | null;
  audioUrl: string | null;
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
  averageRating?: number | null;
  ratingsCount?: number | null;
}

interface ApiResponse {
  beats: Beat[];
  totalPages: number;
  currentPage: number;
  totalBeats: number;
}

const AllBeatsScreen = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('1000');
  const [tagsQuery, setTagsQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBeats, setTotalBeats] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const flatListRef = useRef<FlatList<Beat>>(null);

  const fetchBeats = useCallback(async (pageNum = 1, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (tagsQuery) params.append('tags', tagsQuery);
      params.append('page', pageNum.toString());

      const response = await fetch(`http://${config.serverIP}:5000/beats/?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (pageNum === 1) {
        setBeats(data.beats);
      } else {
        setBeats(prev => [...prev, ...data.beats]);
      }

      setTotalPages(data.totalPages);
      setTotalBeats(data.totalBeats);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching beats:', error);
      Alert.alert('Error', 'Failed to load beats. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, minPrice, maxPrice, tagsQuery]);

  useEffect(() => {
    fetchBeats(1);
  }, [fetchBeats]);

  const handleRefresh = () => {
    fetchBeats(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && page < totalPages) {
      fetchBeats(page + 1);
    }
  };

  const getItemLayout = useCallback(
    (data: ArrayLike<Beat> | null | undefined, index: number) => ({
      length: 110,
      offset: 110 * index,
      index,
    }),
    []
  );

  const renderBeatItem = useCallback(({ item }: { item: Beat }) => (
    <TouchableOpacity
      style={styles.beatCard}
      onPress={() => navigation.navigate('BeatDetails', { beat: item })}
    >
      <Image
        source={{ uri: item.imageUrl ? `http://${config.serverIP}:5000/${item.imageUrl}` : 'https://via.placeholder.com/150' }}
        style={styles.beatImage}
        onError={() => console.log("Image load error")}
      />
      <View style={styles.beatInfo}>
        <Text style={styles.beatTitle}>{item.title}</Text>
        <Text style={styles.beatAuthor}>by {item.user?.username || 'Unknown'}</Text>
        <View style={styles.beatStats}>
          <Text style={styles.beatRating}>
            ⭐ {item.averageRating?.toFixed(1) || 'N/A'} ({item.ratingsCount || 0})
          </Text>
          <Text style={styles.beatPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.beatTags}>
          {item.tags?.join(', ') || 'No tags'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search in title, description, author..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="Min price"
          placeholderTextColor="#888"
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Max price"
          placeholderTextColor="#888"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Tags (comma separated)"
          placeholderTextColor="#888"
          value={tagsQuery}
          onChangeText={setTagsQuery}
        />
      </View>

      {isLoading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={beats}
          keyExtractor={(item) => item._id}
          renderItem={renderBeatItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No beats found. Try different search criteria.
            </Text>
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          windowSize={10}
        />
      )}

      <Text style={styles.resultsText}>
        Showing {beats.length} of {totalBeats} beats
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: 10,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  beatCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    alignItems: 'center',
    elevation: 2,
    height: 110,
  },
  beatImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    margin: 15,
  },
  beatInfo: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  beatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  beatAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  beatStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  beatRating: {
    fontSize: 14,
    color: '#FFD700',
  },
  beatPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  beatTags: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AllBeatsScreen;
