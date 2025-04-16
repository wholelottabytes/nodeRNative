import React, { useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './type';  // Подключаем правильные типы
import config from './config';

type EditBeatRouteProp = RouteProp<RootStackParamList, 'EditBeat'>;

const EditBeatScreen = () => {
  const route = useRoute<EditBeatRouteProp>();
  const navigation = useNavigation();
  const { beat } = route.params;  // Достаём бит из параметров навигации

  const [title, setTitle] = useState(beat.title);
  const [price, setPrice] = useState(String(beat.price));
  const [description, setDescription] = useState(beat.description);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Ошибка', 'Токен не найден');

      await axios.put(
        `http://${config.serverIP}:5000/beats/${beat._id}`,
        {
          title,
          price: parseFloat(price),
          description,
          user: beat.user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Успех', 'Бит обновлён');
      navigation.goBack();  // Возвращаемся на предыдущий экран
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Ошибка', err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Ошибка', 'Токен не найден');

      await axios.delete(`http://${config.serverIP}:5000/beats/${beat._id}`, {
        data: { user: beat.user._id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Успех', 'Бит удалён');
      navigation.goBack();  // Возвращаемся на предыдущий экран
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Ошибка', err.response?.data?.error || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Название:</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Цена:</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Описание:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <Button title="Сохранить изменения" onPress={handleUpdate} />
      <View style={{ height: 16 }} />
      <Button title="Удалить бит" color="red" onPress={handleDelete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
});

export default EditBeatScreen;
