import React, { useState, useContext } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { AuthContext } from './AuthContext';

const AddBeatScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Проверка заполненности всех полей
	if(user!=null){
	Alert.alert(user._id);
	}
	else('юзер пуст')
    if (!title || !author || !price || !description || !tags || !imageUrl || !audioUrl) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    // Формирование объекта для нового бита
    const newBeat = {
      title,
      author,
      price: Number(price),
      description,
      tags: tags.split(',').map(tag => tag.trim()),
      imageUrl,
      audioUrl,
      user: user && user._id, // предполагается, что в AuthContext хранится id пользователя
    };

    try {
      const response = await fetch('http://192.168.8.12:5000/beats/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBeat)
      });
      
      // Проверяем заголовок ответа
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorMessage = 'Ошибка при создании бита';
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // Если ответ не JSON, читаем как текст
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Если все хорошо, читаем JSON-ответ
      const data = await response.json();
      Alert.alert('Успех', `Бит успешно создан, ID: ${data._id || 'неизвестно'}`);
      navigation.navigate('Home');
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
        onChangeText={setAuthor}
        style={styles.input}
        mode="outlined"
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
        numberOfLines={4}
      />
      <TextInput
        label="Теги (через запятую)"
        value={tags}
        onChangeText={setTags}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Ссылка на изображение"
        value={imageUrl}
        onChangeText={setImageUrl}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Ссылка на аудио"
        value={audioUrl}
        onChangeText={setAudioUrl}
        style={styles.input}
        mode="outlined"
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
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6200ee',
    fontSize: 24,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
  },
  buttonContent: {
    paddingVertical: 10,
  },
});

export default AddBeatScreen;
