import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Button, Title, Paragraph } from 'react-native-paper';
import SoundPlayer from 'react-native-sound-player';
import { Star } from 'react-native-feather';
import { BeatDetailsScreenProps } from './type';

const BeatDetailsScreen: React.FC<BeatDetailsScreenProps> = ({ route, navigation: _navigation }) => {
  const { beat } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rating, setRating] = useState(0);

  // Загружаем аудиофайл при монтировании
  useEffect(() => {
    try {
      SoundPlayer.loadSoundFile(beat.audioUrl, 'mp3');
      SoundPlayer.getInfo()
        .then(info => {
          setDuration(info.duration);
          setCurrentTime(info.currentTime);
        })
        .catch(e => console.log('Ошибка получения информации о звуке', e));
    } catch (e) {
      console.log('Ошибка загрузки аудио', e);
    }
    return () => {
      try {
        SoundPlayer.stop();
      } catch (e) {
        // Игнорируем ошибки
      }
    };
  }, [beat.audioUrl]);

  // Обновляем время каждые 500 мс при воспроизведении
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        try {
          const info = await SoundPlayer.getInfo();
          setCurrentTime(info.currentTime);
        } catch (e) {
          console.log('Ошибка получения времени', e);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    try {
      if (isPlaying) {
        SoundPlayer.stop();
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        SoundPlayer.playSoundFile(beat.audioUrl, 'mp3');
        setIsPlaying(true);
      }
    } catch (e) {
      console.log('Ошибка воспроизведения аудио', e);
    }
  };

  const handleSliderChange = async (value: number) => {
    try {
      await SoundPlayer.seek(value);
      setCurrentTime(value);
    } catch (e) {
      console.log('Ошибка перемотки', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Обложка альбома */}
      <View style={styles.albumArtContainer}>
        <Image
          source={{ uri: `http://192.168.8.12:5000/${beat.imageUrl}` }}
          style={styles.albumArt}
        />
      </View>
      {/* Информация о бите и элементы управления плеером */}
      <View style={styles.infoContainer}>
        <Title style={styles.title}>{beat.title}</Title>
        <Paragraph style={styles.author}>Автор: {beat.author}</Paragraph>
        <Paragraph style={styles.description}>{beat.description}</Paragraph>
        <Paragraph style={styles.tags}>Теги: {beat.tags.join(', ')}</Paragraph>
        <Paragraph style={styles.likes}>Лайков: {beat.likes}</Paragraph>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Star
                fill={rating >= star ? '#FFD700' : 'transparent'}
                stroke={rating >= star ? '#FFD700' : '#000'}
                width={30}
                height={30}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Button mode="contained" style={styles.buyButton}>
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
  likes: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
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
