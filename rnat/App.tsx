import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import BeatDetailsScreen from './BeatDetailsScreen';
// import AddBeatScreen from './AddBeatScreen';
import { View, Text } from 'react-native';
import MyBeatsScreen from './MyBeatsScreen';
import EditBeatScreen from './EditBeatScreen';
import AddBeatScreen from './AddBeatScreen';
// Заглушка для экранов, если потребуется
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Categories" component={() => <PlaceholderScreen title="Categories" />} />
    <Tab.Screen name="Add" component={MyBeatsScreen} />
    <Tab.Screen name="Favorites" component={() => <PlaceholderScreen title="Favorites" />} />
    <Tab.Screen name="Profile" component={() => <PlaceholderScreen title="Profile" />} />
  </Tab.Navigator>
);

const AppContent = () => {
  const authContext = React.useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext не был предоставлен');
  }
  const { isAuthenticated } = authContext;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
        <Stack.Screen
          name="BeatDetails"
          component={BeatDetailsScreen as React.ComponentType<any>}
        />
        <Stack.Screen
          name="EditBeat"
          component={EditBeatScreen as React.ComponentType<any>}
           options={{ headerShown: true, title: 'Редактировать бит' }}
        />
        <Stack.Screen
          name="AddBeat"
          component={AddBeatScreen as React.ComponentType<any>}
          options={{ headerShown: true, title: 'Добавить бит' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
