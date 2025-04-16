import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './type'; // Путь к типам навигации
import config from './config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyBeats'>;

const MyBeatsScreen = () => {
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const fetchBeats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Токен не найден, пожалуйста, войдите заново');
        return;
      }

      const response = await axios.get(`http://${config.serverIP}:5000/beats/my-beats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBeats(response.data);
      setError(null);
    } catch (err: any) {
      console.log("Ошибка при получении битов:", err.response?.data || err.message);
      setError(`Ошибка: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeats();
  }, []);

  // Обработчик долгого нажатия
  const handleLongPress = (beat: any) => {
    Alert.alert('Что вы хотите сделать?', '', [
      {
        text: 'Изменить',
        onPress: () => {
          navigation.navigate('EditBeat', { beat });
        },
      },
      {
        text: 'Удалить',
        onPress: () => {
          // Логика для удаления бита
          deleteBeat(beat._id);
        },
      },
      {
        text: 'Отмена',
        style: 'cancel',
      },
    ]);
  };

  // Функция для удаления бита
  const deleteBeat = async (beatId: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Токен не найден, пожалуйста, войдите заново');
      return;
    }

    await axios.delete(`http://${config.serverIP}:5000/beats/${beatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Перезагружаем биты после удаления
    fetchBeats();
    Alert.alert('Успех', 'Бит удален');
  } catch (err: any) {
    console.log('Ошибка при удалении бита:', err.response?.data || err.message);
    Alert.alert('Ошибка', `Не удалось удалить бит: ${err.response?.data?.error || err.message}`);
  }
};

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('BeatDetails', { beat: item })}
      onLongPress={() => handleLongPress(item)} // Добавляем обработчик долгого нажатия
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text>Автор: {item.user.username}</Text>
      <Text>Цена: ${item.price}</Text>
      <Text>Описание: {item.description}</Text>
    </TouchableOpacity>
  );

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

  <TouchableOpacity
    style={styles.addButton}
    onPress={() => navigation.navigate('AddBeat')}
  >
    <Text style={styles.addButtonText}>＋ Добавить бит</Text>
  </TouchableOpacity>
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
  },
  addButton: {
  backgroundColor: '#4CAF50',
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  alignItems: 'center',
},
addButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});

export default MyBeatsScreen;
