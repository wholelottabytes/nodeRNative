import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import BeatDetailsScreen from './BeatDetailsScreen';
import MyBeatsScreen from './MyBeatsScreen';
import EditBeatScreen from './EditBeatScreen';
import ProfileScreen from './ProfileScreen';
import AddBeatScreen from './AddBeatScreen';
import LikedBeatsScreen from './LikedBeatsScreen';
import AllBeatsScreen from './AllBeatsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator 
    screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        paddingBottom: 5,
        height: 60,
      }
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={AllBeatsScreen} />
    <Tab.Screen name="Add" component={MyBeatsScreen} />
    <Tab.Screen name="Rated" component={LikedBeatsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppContent = () => {
  const authContext = React.useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext не был предоставлен');
  }
  const { isAuthenticated } = authContext;
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}