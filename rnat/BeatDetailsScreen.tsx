import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import Slider from '@react-native-community/slider';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import { Star, Play, Pause, ShoppingCart } from 'react-native-feather';
import LinearGradient from 'react-native-linear-gradient';
import { BeatDetailsScreenProps } from './type';
import config from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');
const AnimatedStar = Animated.createAnimatedComponent(Star);

interface VideoRefType {
  seek: (time: number) => void;
}

const BeatDetailsScreen: React.FC<BeatDetailsScreenProps> = ({ route, navigation }) => {
  const { beat } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const videoRef = useRef<VideoRefType | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  const translateYInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 15]
  });

  const fetchRatings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `http://${config.serverIP}:5000/beats/rating/${beat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRating(response.data.userRating);
      setAverageRating(response.data.averageRating);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  }, [beat._id]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleRate = async (value: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authorization required');
        return;
      }

      setRating(value);
      await axios.post(
        `http://${config.serverIP}:5000/beats/rate/${beat._id}`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchRatings();
      Alert.alert('Thank you!', 'Rating submitted');
    } catch (error: any) {
      console.error('Rating error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Submission failed');
    }
  };

  const handleBuy = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authorization required');
        return;
      }

      await axios.post(
        `http://${config.serverIP}:5000/beats/buy/${beat._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Purchase completed!');
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Purchase failed');
    }
  };

  const handleLoad = (data: OnLoadData) => {
    setDuration(data.duration);
  };

  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => setIsPlaying(prev => !prev);

  const handleSliderChange = (value: number) => {
    videoRef.current?.seek(value);
    setCurrentTime(value);
  };

  return (
    <LinearGradient 
      colors={['#1a1a1a', '#2a2a2a']} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Video
          ref={videoRef as React.RefObject<any>}
          source={{ uri: `http://${config.serverIP}:5000/${beat.audioUrl}` }}
          paused={!isPlaying}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          style={{ width: 0, height: 0 }}
          playInBackground
          playWhenInactive
        />

        <View style={styles.artworkContainer}>
          <Animated.Image
            source={{ uri: `http://${config.serverIP}:5000/${beat.imageUrl}` }}
            style={[
              styles.artwork,
              {
                transform: [
                  { rotate: floatInterpolation },
                  { translateY: translateYInterpolation }
                ],
                opacity: isArtworkLoaded ? 1 : 0
              }
            ]}
            onLoad={() => setIsArtworkLoaded(true)}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{beat.title}</Text>
         
    <TouchableOpacity 
  onPress={() => navigation.navigate('UserProfile', { username: beat.author })}
>
  <Text style={styles.artist}>
    by {beat.user?.username || beat.author || 'Unknown'}
  </Text>
</TouchableOpacity>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => handleRate(star)}
                activeOpacity={0.7}
              >
                <AnimatedStar
                  fill={rating >= star ? '#FFD700' : 'transparent'}
                  stroke={rating >= star ? '#FFD700' : '#fff'}
                  width={32}
                  height={32}
                />
              </TouchableOpacity>
            ))}
          </View>

          {averageRating !== null && (
            <Text style={styles.averageRating}>
              Average: {averageRating.toFixed(1)}/5
            </Text>
          )}

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Price</Text>
              <Text style={styles.metaValue}>${beat.price}</Text>
            </View>
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity 
              onPress={togglePlay}
              style={styles.playButton}
            >
              {isPlaying ? (
                <Pause width={32} height={32} color="#fff" />
              ) : (
                <Play width={32} height={32} color="#fff" />
              )}
            </TouchableOpacity>

            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={handleSliderChange}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#555"
              thumbTintColor="#fff"
            />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(duration)}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.buyButton}
            onPress={handleBuy}
          >
            <ShoppingCart width={24} height={24} color="#000" />
            <Text style={styles.buyButtonText}>Purchase Now</Text>
          </TouchableOpacity>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{beat.description}</Text>
            <View style={styles.tagsContainer}>
              {beat.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  artworkContainer: {
    width: width,
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  artwork: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  artist: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  averageRating: {
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 40,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  progressBar: {
    flex: 1,
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  buyButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    marginBottom: 25,
  },
  buyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  descriptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default BeatDetailsScreen;