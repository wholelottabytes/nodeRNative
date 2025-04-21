import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import config from './config';
import { AuthContext } from './AuthContext';

const SERVER_URL = `http://${config.serverIP}:5000`;

type UserProfile = {
  username: string;
  userPhoto?: string;
  description?: string;
  balance?: number;
};

type Purchase = {
  id: string;
  beatTitle: string;
  beatImage: string;
  amount: number;
  date: string;
};

type Sale = Purchase & {
  buyerUsername: string;
};

const ProfileScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get<UserProfile>(`${SERVER_URL}/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(res.data);
      setDescription(res.data.description || '');
    } catch (e) {
      console.error('Ошибка получения профиля', e);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get<{ purchases: Purchase[]; sales: Sale[] }>(
        `${SERVER_URL}/profile/transactions`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPurchases(res.data.purchases);
      setSales(res.data.sales);
    } catch (e) {
      console.error('Ошибка получения транзакций', e);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchTransactions();
  }, [fetchProfile, fetchTransactions]);

  if (!auth || !user) {
    return <Text style={styles.loading}>Пожалуйста, войдите</Text>;
  }
const { logout } = auth;

  const updateDescription = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/profile/description`,
        { description },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      Alert.alert('Успех', 'Описание обновлено');
      fetchProfile();
    } catch {
      Alert.alert('Ошибка', 'Не удалось обновить описание');
    }
  };

  const topUpBalance = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    try {
      await axios.put(
        `${SERVER_URL}/profile/balance`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      Alert.alert('Успех', 'Баланс пополнен');
      setAmount('');
      fetchProfile();
    } catch {
      Alert.alert('Ошибка', 'Не удалось пополнить баланс');
    }
  };

  const uploadPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (result.assets?.length) {
      const { uri, fileName, type } = result.assets[0];
      const formData = new FormData();
      formData.append('photo', { uri, name: fileName, type } as any);
      try {
        await axios.put(`${SERVER_URL}/profile/photo`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
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

  if (!profile) {
    return <Text style={styles.loading}>Загрузка профиля...</Text>;
  }

  const renderPurchase = ({ item }: ListRenderItemInfo<Purchase>) => (
    <View style={styles.txRow}>
      <Image source={{ uri: `${SERVER_URL}/${item.beatImage}` }} style={styles.txImg} />
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{item.beatTitle}</Text>
        <Text>Цена: {item.amount} ₽</Text>
        <Text style={styles.txDate}>{new Date(item.date).toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderSale = ({ item }: ListRenderItemInfo<Sale>) => (
    <View style={styles.txRow}>
      <Image source={{ uri: `${SERVER_URL}/${item.beatImage}` }} style={styles.txImg} />
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{item.beatTitle}</Text>
        <Text>Купил: {item.buyerUsername}</Text>
        <Text>Сумма: {item.amount} ₽</Text>
        <Text style={styles.txDate}>{new Date(item.date).toLocaleString()}</Text>
      </View>
    </View>
  );

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

      <Text style={styles.txHeading}>Мои покупки:</Text>
      <FlatList
        data={purchases}
        keyExtractor={item => item.id}
        renderItem={renderPurchase}
      />

      <Text style={styles.txHeading}>Мои продажи:</Text>
      <FlatList
        data={sales}
        keyExtractor={item => item.id}
        renderItem={renderSale}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loading:   { padding: 20, textAlign: 'center' },
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  avatar:    { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 10 },
  username:  { fontSize: 22, textAlign: 'center', fontWeight: 'bold' },
  label:     { marginTop: 15, fontWeight: 'bold' },
  input:     { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 10 },
  balance:   { marginTop: 20, fontSize: 18 },
  txHeading: { marginTop: 30, fontSize: 18, fontWeight: 'bold' },
  txRow:     { flexDirection: 'row', marginVertical: 10, alignItems: 'center' },
  txImg:     { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  txInfo:    { flex: 1 },
  txTitle:   { fontWeight: 'bold' },
  txDate:    { fontSize: 12, color: '#666' },
});

export default ProfileScreen;
