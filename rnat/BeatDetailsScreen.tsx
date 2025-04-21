import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Button, Title, Paragraph } from 'react-native-paper';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import { Star } from 'react-native-feather';
import { BeatDetailsScreenProps } from './type';
import config from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

// Определяем собственный тип для рефа Video
interface VideoRefType {
  seek: (time: number) => void;
  // Можно добавить и другие методы, если они нужны (pause, resume, etc.)
}

const BeatDetailsScreen: React.FC<BeatDetailsScreenProps> = ({ route, navigation: _navigation }) => {
  const { beat } = route.params;
  console.log(beat);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);


  // Используем реф с собственным типом
  const videoRef = useRef<VideoRefType | null>(null);

const fetchRatings = useCallback(async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const response = await axios.get(
      `http://${config.serverIP}:5000/beats/rating/${beat._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRating(response.data.userRating);
    setAverageRating(response.data.averageRating);
  } catch (error) {
    console.error('Ошибка при загрузке рейтингов:', error);
  }
}, [beat._id]);


useEffect(() => {
  fetchRatings();
}, [fetchRatings]);

  const handleRate = async (value: number) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Ошибка', 'Вы не авторизованы');
      return;
    }

    setRating(value); // Обновляем локально

    // Сначала обновляем состояние, а потом отправляем на сервер
    await axios.post(
      `http://${config.serverIP}:5000/beats/rate/${beat._id}`,
      { value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // После того как поставили оценку, обновляем рейтинг с сервера
    fetchRatings(); 
    Alert.alert('Спасибо за оценку!');
  } catch (error: any) {
    console.error('Ошибка при выставлении оценки:', error);
    Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось поставить оценку');
  }
};


const handleBuy = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Ошибка', 'Вы не авторизованы');
      return;
    }

    await axios.post(
      `http://${config.serverIP}:5000/beats/buy/${beat._id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Alert.alert('Успех', 'Бит успешно куплен!');
    // Дополнительно можно обновить UI, например, баланс
  } catch (error: any) {
    console.error('Ошибка при покупке бита:', error);
    Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось купить бит');
  }
};

  // Обработчик загрузки аудио (получение длительности)
  const handleLoad = (data: OnLoadData) => {
    setDuration(data.duration);
  };

  // Обновление текущего времени
  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  // Обработка завершения воспроизведения
  const handleEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleSliderChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
      setCurrentTime(value);
    }
  };

  return (
    <View style={styles.container}>
      {/* Скрытый компонент Video для аудио */}
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

      {/* Обложка альбома */}
      <View style={styles.albumArtContainer}>
        <Image
          source={{ uri: `http://${config.serverIP}:5000/${beat.imageUrl}` }}
          style={styles.albumArt}
        />
      </View>
      {/* Информация о бите и элементы управления плеером */}
      <View style={styles.infoContainer}>
        <Title style={styles.title}>{beat.title}</Title>
        <Paragraph style={styles.author}>Автор: {beat.author}</Paragraph>
        <Paragraph style={styles.description}>{beat.description}</Paragraph>
        <Paragraph style={styles.tags}>Теги: {beat.tags.join(', ')}</Paragraph>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRate(star)}>
            <Star
               fill={rating >= star ? '#FFD700' : 'transparent'}
               stroke={rating >= star ? '#FFD700' : '#000'}
               width={30}
               height={30}
              />
           </TouchableOpacity>
            ))}
        </View>
              {averageRating !== null && (
          <Text style={{ textAlign: 'center', marginBottom: 10 }}>
            Средняя оценка: {averageRating.toFixed(1)} ⭐
          </Text>
        )}
       <Button mode="contained" style={styles.buyButton} onPress={handleBuy}>
          Купить за ${beat.price}
        </Button>
        <View style={styles.playerContainer}>
          <Button
            mode="contained"
            onPress={togglePlay}
            style={styles.playButton}
          >
            {isPlaying ? 'Пауза' : 'Воспроизвести'}
          </Button>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onSlidingComplete={handleSliderChange}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#888"
            thumbTintColor="#6200ee"
          />
          <Text style={styles.timeText}>
            {`${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
              .toString()
              .padStart(2, '0')} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60)
              .toString()
              .padStart(2, '0')}`}
          </Text>
          <Paragraph >
  {beat.createdAt ? `Дата появления: ${new Date(beat.createdAt).toLocaleDateString()}` : ''}
</Paragraph>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    marginBottom: 10,
  },
  author: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  tags: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buyButton: {
    alignSelf: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  playerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  playButton: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  slider: {
    width: '100%',
    marginVertical: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
});

export default BeatDetailsScreen;
