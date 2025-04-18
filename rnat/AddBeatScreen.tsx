import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { AuthContext } from './AuthContext';
import config from './config';
import { pick } from '@react-native-documents/picker';

const SERVER = `http://${config.serverIP}:5000`;

interface PickedFile {
  uri: string;
  name: string | null;
  type: string | null;
}

const AddBeatScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [imageFile, setImageFile] = useState<PickedFile | null>(null);
  const [audioFile, setAudioFile] = useState<PickedFile | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setAuthor(user.username);
    }
  }, [user]);

  // Генерация уникального имени файла
  const generateUniqueFilename = (extension: string): string => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}${extension}`;
  };

  // Выбор изображения
  const handleImagePicker = async () => {
    try {
      const [file] = await pick({ type: ['image/*'], mode: 'import' });
      const uniqueName = generateUniqueFilename('.jpg');
      setImageFile({ uri: file.uri, name: uniqueName, type: file.type });
    } catch (err: any) {
      if (err.code !== 'OPERATION_CANCELED') {
        Alert.alert('Ошибка', 'Не удалось выбрать изображение');
      }
    }
  };

  // Выбор аудио
  const handleAudioPicker = async () => {
    try {
      const [file] = await pick({ type: ['audio/*'], mode: 'import' });
      const uniqueName = generateUniqueFilename('.mp3');
      setAudioFile({ uri: file.uri, name: uniqueName, type: file.type });
    } catch (err: any) {
      if (err.code !== 'OPERATION_CANCELED') {
        Alert.alert('Ошибка', 'Не удалось выбрать аудио');
      }
    }
  };

const handleSubmit = async () => {
  if (!title || !author || !price || !description || !tags || !imageFile || !audioFile) {
    Alert.alert('Ошибка', 'Заполните все поля и выберите файлы');
    return;
  }

  setLoading(true);
  try {
    const token = user?.token;

    // Загрузить изображение
    const imgData = new FormData();
    imgData.append('image', {
      uri: imageFile.uri,
      name: imageFile.name ?? 'photo.jpg',
      type: imageFile.type ?? 'image/jpeg',
    } as any);

    const imgRes = await fetch(`${SERVER}/beats/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: imgData,
    });

    const imgText = await imgRes.text(); // Получаем ответ как текст
    console.log('Image upload response:', imgText); // Печатаем ответ сервера

    if (!imgRes.ok) {
      throw new Error('Ошибка загрузки изображения');
    }
    const imgJson = JSON.parse(imgText); // Пытаемся распарсить JSON, если ответ в формате JSON
    console.log('Image JSON:', imgJson);

    // Загрузить аудио
    const audioData = new FormData();
    audioData.append('audio', {
      uri: audioFile.uri,
      name: audioFile.name ?? 'audio.mp3',
      type: audioFile.type ?? 'audio/mpeg',
    } as any);

    const audioRes = await fetch(`${SERVER}/beats/upload-audio`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: audioData,
    });

    const audioText = await audioRes.text(); // Получаем ответ как текст
    console.log('Audio upload response:', audioText); // Печатаем ответ сервера

    if (!audioRes.ok) {
      throw new Error('Ошибка загрузки аудио');
    }
    const audioJson = JSON.parse(audioText); // Пытаемся распарсить JSON, если ответ в формате JSON
    console.log('Audio JSON:', audioJson);

    // Создать бит
    const newBeat = {
      title,
      author,
      price: Number(price),
      description,
      tags: tags.split(',').map(t => t.trim()),
      imageUrl: imgJson.imageUrl,
      audioUrl: audioJson.audioUrl,
      user: user!._id,
    };

    const beatRes = await fetch(`${SERVER}/beats/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newBeat),
    });

    const beatText = await beatRes.text();
    console.log('Beat creation response:', beatText); // Печатаем ответ сервера

    if (!beatRes.ok) {
      throw new Error('Ошибка создания бита');
    }
    const beatJson = JSON.parse(beatText);
    console.log('Beat JSON:', beatJson);

    Alert.alert('Успех', `Бит создан, ID: ${beatJson._id}`);
    navigation.navigate('Main', { screen: 'Home' });
  } catch (error: any) {
    Alert.alert('Ошибка', error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Добавить новый бит</Title>

      <TextInput
        label="Название"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Автор"
        value={author}
        style={styles.input}
        mode="outlined"
        editable={false}
      />

      <TextInput
        label="Цена"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />

      <TextInput
        label="Описание"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
      />

      <TextInput
        label="Теги (через запятую)"
        value={tags}
        onChangeText={setTags}
        style={styles.input}
        mode="outlined"
      />

      <Button onPress={handleImagePicker} mode="outlined" style={styles.button}>
        Выбрать изображение
      </Button>
      <TextInput
        label="Выбранное изображение"
        value={imageFile?.name || ''}
        style={styles.input}
        mode="outlined"
        editable={false}
      />

      <Button onPress={handleAudioPicker} mode="outlined" style={styles.button}>
        Выбрать аудио
      </Button>
      <TextInput
        label="Выбранное аудио"
        value={audioFile?.name || ''}
        style={styles.input}
        mode="outlined"
        editable={false}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Создать бит
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f2f2f2' },
  title: { textAlign: 'center', marginBottom: 20, fontSize: 24, color: '#6200ee' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  button: { marginTop: 10 },
  buttonContent: { paddingVertical: 10 },
});

export default AddBeatScreen;
