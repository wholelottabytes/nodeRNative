import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { AuthContext } from './AuthContext';
import config from './config';
import { Beat, LikedBeatsScreenProps } from './type.ts';

const SERVER = `http://${config.serverIP}:5000`;


const LikedBeatsScreen: React.FC<LikedBeatsScreenProps> = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [likedBeats, setLikedBeats] = useState<Beat[]>([]);
  const [scoreFilter, setScoreFilter] = useState<number | null>(null);

  const fetchLikedBeats = useCallback(async () => {
  try {
    const token = user?.token;
    const url = `${SERVER}/beats/liked${scoreFilter ? `?score=${scoreFilter}` : ''}`;
    console.log('URL для запроса:', url); // Логируем URL запроса

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log('Полученные данные:', data); // Логируем полученные данные

    setLikedBeats(data);
  } catch (err) {
    console.error('Ошибка загрузки лайкнутых битов:', err);
  }
}, [scoreFilter, user?.token]);


  useEffect(() => {
    fetchLikedBeats();
  }, [fetchLikedBeats]);

  const renderItem = useCallback(({ item }: { item: Beat }) => (
    <TouchableOpacity onPress={() => navigation.navigate('BeatDetails', { beat: item })}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: `${SERVER}/${item.imageUrl}` }} />
        <Card.Title title={item.title} subtitle={item.author} />
      </Card>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Оценка:</Text>
      <View style={styles.filterRow}>
        {[1, 2, 3, 4, 5].map(score => (
          <Button
            key={score}
            mode={scoreFilter === score ? 'contained' : 'outlined'}
            onPress={() => setScoreFilter(scoreFilter === score ? null : score)}
            style={styles.filterBtn}
          >
            {score}
          </Button>
        ))}
      </View>

      <FlatList
        data={likedBeats}
        keyExtractor={item => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  heading: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  filterBtn: { flex: 1, marginHorizontal: 5 },
  card: { marginBottom: 10 },
});

export default LikedBeatsScreen;
