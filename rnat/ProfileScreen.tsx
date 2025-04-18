import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  Image, TextInput,
  Button, Alert, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import config from './config';

const SERVER_URL = `http://${config.serverIP}:5000`;

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/profile`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setProfile(res.data);
      setDescription(res.data.description || '');
    } catch (e) {
      console.error('Ошибка получения профиля', e);
    }
  }, [user?.token]);

  const updateDescription = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/profile/description`,
        { description },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      Alert.alert('Успех', 'Описание обновлено');
      fetchProfile();
    } catch {
      Alert.alert('Ошибка', 'Не удалось обновить описание');
    }
  };

  const topUpBalance = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/profile/balance`,
        { amount },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      Alert.alert('Успех', 'Баланс пополнен');
      fetchProfile();
    } catch {
      Alert.alert('Ошибка', 'Не удалось пополнить баланс');
    }
  };

  const uploadPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });
    if (result.assets?.length) {
      const { uri, fileName, type } = result.assets[0];
      const formData = new FormData();
      formData.append('photo', { uri, name: fileName, type } as any);

      try {
        await axios.put(`${SERVER_URL}/profile/photo`, formData, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        Alert.alert('Успех', 'Фото обновлено');
        fetchProfile();
      } catch {
        Alert.alert('Ошибка', 'Не удалось загрузить фото');
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!profile) {
    return <Text style={styles.loading}>Загрузка профиля...</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={uploadPhoto}>
        <Image
          source={
            profile.userPhoto
              ? { uri: `${SERVER_URL}/${profile.userPhoto}` }
              : require('./assets/default-avatar.png')
          }
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.username}>{profile.username}</Text>

      <Text style={styles.label}>Описание:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Добавь описание..."
      />
      <Button title="Обновить описание" onPress={updateDescription} />

      <Text style={styles.balance}>Баланс: {profile.balance || 0} ₽</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Сумма пополнения"
        keyboardType="numeric"
      />
      <Button title="Пополнить баланс" onPress={topUpBalance} />

      <Button title="Выйти" color="red" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  loading: { padding: 20, textAlign: 'center' },
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    alignSelf: 'center', marginBottom: 10,
  },
  username: { fontSize: 22, textAlign: 'center', fontWeight: 'bold' },
  label: { marginTop: 15, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginTop: 5, marginBottom: 10,
  },
  balance: { marginTop: 20, fontSize: 18 },
});

export default ProfileScreen;
