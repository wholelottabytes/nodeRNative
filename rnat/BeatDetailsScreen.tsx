import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import SoundPlayer from 'react-native-sound-player';
import { Star } from 'react-native-feather';
import { BeatDetailsScreenProps } from './type.ts';

const BeatDetailsScreen: React.FC<BeatDetailsScreenProps> = ({ route, navigation: _navigation }) => {
    const { beat } = route.params;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [rating, setRating] = useState(0);

    // Загружаем аудиофайл при монтировании
    useEffect(() => {
        try {
            // Загрузка аудиофайла
            SoundPlayer.loadSoundFile(beat.path, 'mp3');
            SoundPlayer.getInfo()
                .then(info => {
                    setDuration(info.duration);
                    setCurrentTime(info.currentTime);
                })
                .catch(e => {
                    console.log('Ошибка получения информации о звуке', e);
                });
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
    }, [beat.path]);

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
                SoundPlayer.playSoundFile(beat.path, 'mp3');
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
            <ImageBackground source={beat.image} style={styles.image}>
                <View style={styles.overlay}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.title}>{beat.title}</Title>
                            <Paragraph style={styles.author}>Автор: {beat.author}</Paragraph>
                            <Paragraph style={styles.price}>Цена: ${beat.price}</Paragraph>
                            <Paragraph style={styles.description}>{beat.description}</Paragraph>
                            <Paragraph style={styles.tags}>Теги: {beat.tags.join(', ')}</Paragraph>
                            <Paragraph style={styles.likes}>Лайков: {beat.likes}</Paragraph>
                            <Paragraph style={styles.path}>Путь: {beat.path}</Paragraph>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Star
                                            fill={rating >= star ? '#FFD700' : 'transparent'}
                                            stroke={rating >= star ? '#FFD700' : '#fff'}
                                            width={30}
                                            height={30}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Button mode="contained" style={styles.buyButton}>
                                Купить за ${beat.price}
                            </Button>
                        </Card.Content>
                    </Card>
                    <View style={styles.playerContainer}>
                        <Button
                            mode="contained"
                            icon={isPlaying ? 'pause' : 'play'}
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
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    image: { flex: 1, justifyContent: 'flex-end', padding: 20 },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: 20, borderRadius: 10 },
    card: { marginBottom: 20, borderRadius: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#6200ee' },
    author: { fontSize: 16, color: '#fff', marginTop: 10 },
    price: { fontSize: 16, color: '#fff', marginTop: 10 },
    description: { fontSize: 14, color: '#fff', marginTop: 10 },
    tags: { fontSize: 14, color: '#fff', marginTop: 10 },
    likes: { fontSize: 14, color: '#fff', marginTop: 10 },
    path: { fontSize: 14, color: '#fff', marginTop: 10 },
    ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
    buyButton: { marginTop: 20, padding: 10, borderRadius: 5 },
    playerContainer: { marginTop: 20 },
    playButton: { marginBottom: 15 },
    slider: { width: '100%', marginVertical: 10 },
    timeText: { fontSize: 14, color: '#fff', textAlign: 'center' },
});

export default BeatDetailsScreen;
