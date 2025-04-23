import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView
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

type Transaction = {
  id: string;
  beatTitle: string;
  beatImage: string;
  amount: number;
  date: string;
  buyerUsername?: string;
};

const ProfileScreen = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<{
    purchases: Transaction[];
    sales: Transaction[];
  }>({ purchases: [], sales: [] });
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await axios.get<UserProfile>(`${SERVER_URL}/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(res.data);
      setDescription(res.data.description || '');
    } catch (e) {
      console.error('Error fetching profile', e);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get<{ purchases: Transaction[]; sales: Transaction[] }>(
        `${SERVER_URL}/profile/transactions`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTransactions(res.data);
    } catch (e) {
      console.error('Error fetching transactions', e);
      Alert.alert('Error', 'Failed to load transactions');
    }
  }, [user]);

  const loadData = useCallback(async () => {
    await Promise.all([fetchProfile(), fetchTransactions()]);
  }, [fetchProfile, fetchTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!auth || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Please log in</Text>
      </View>
    );
  }

  const { logout } = auth;

  const updateDescription = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/profile/description`,
        { description },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      Alert.alert('Success', 'Description updated');
      fetchProfile();
    } catch {
      Alert.alert('Error', 'Failed to update description');
    }
  };

  const topUpBalance = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    try {
      await axios.put(
        `${SERVER_URL}/profile/balance`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      Alert.alert('Success', 'Balance updated');
      setAmount('');
      fetchProfile();
    } catch {
      Alert.alert('Error', 'Failed to update balance');
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
        Alert.alert('Success', 'Photo updated');
        fetchProfile();
      } catch {
        Alert.alert('Error', 'Failed to upload photo');
      }
    }
  };

  const renderTransaction = (item: Transaction) => (
    <TouchableOpacity 
      style={styles.transactionCard} 
      key={item.id}
      onPress={() => {/* navigation to beat details */}}
    >
      <Image 
        source={{ uri: item.beatImage ? `${SERVER_URL}/${item.beatImage}` : 'https://via.placeholder.com/150' }} 
        style={styles.transactionImage}
      />
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.beatTitle}</Text>
        {item.buyerUsername && (
          <Text style={styles.transactionBuyer}>Buyer: {item.buyerUsername}</Text>
        )}
        <Text style={styles.transactionAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
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
          <Text style={styles.balance}>Balance: ${profile.balance?.toFixed(2) || '0.00'}</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell about yourself..."
            multiline
          />
          <TouchableOpacity style={styles.blackButton} onPress={updateDescription}>
            <Text style={styles.buttonText}>Update Description</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Top Up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Up Balance</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.blackButton} onPress={topUpBalance}>
            <Text style={styles.buttonText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'purchases' && styles.activeTab]}
            onPress={() => setActiveTab('purchases')}
          >
            <Text style={styles.tabText}>My Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'sales' && styles.activeTab]}
            onPress={() => setActiveTab('sales')}
          >
            <Text style={styles.tabText}>My Sales</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : (
            (activeTab === 'purchases' ? transactions.purchases : transactions.sales).map(renderTransaction)
          )}
          {!isLoading && transactions[activeTab].length === 0 && (
            <Text style={styles.emptyText}>No {activeTab} found</Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  balance: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#000',
  },
  blackButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontWeight: '600',
    color: '#000',
  },
  transactionsContainer: {
    minHeight: 200,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  transactionImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  transactionBuyer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
});

export default ProfileScreen;