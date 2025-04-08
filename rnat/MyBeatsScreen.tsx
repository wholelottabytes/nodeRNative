import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';

const MyBeatsScreen = () => {
  const [beats, setBeats] = useState<any[]>([]); // Состояние для битов
  const [loading, setLoading] = useState<boolean>(true); // Состояние загрузки
  const [error, setError] = useState<string | null>(null); // Состояние ошибки

  // Функция для получения битов пользователя
const fetchBeats = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Токен не найден, пожалуйста, войдите заново');
      return;
    }

    console.log('Токен, который отправляем:', token);

    const response = await axios.get(`http://${config.serverIP}:5000/beats/my-beats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    setBeats(response.data);
    setError(null); // сбрасываем ошибку, если всё прошло успешно
  } catch (err: any) {
    console.log("Ошибка при получении битов:", err.response?.data || err.message);
    setError(`Ошибка: ${err.response?.data?.error || err.message}`);
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    fetchBeats(); // Загружаем биты при монтировании компонента
  }, []);

  // Функция для рендеринга каждого элемента списка
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>Автор: {item.user.username}</Text>
      <Text>Цена: ${item.price}</Text>
      <Text>Описание: {item.description}</Text>
    </View>
  );

  // Рендеринг страницы
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={beats}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}
      <Button title="Обновить" onPress={fetchBeats} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default MyBeatsScreen;
