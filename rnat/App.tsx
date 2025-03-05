import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{title}</Text>
    </View>
);

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={{ headerShown: false }}>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Categories" component={() => <PlaceholderScreen title="Categories" />} />
                <Tab.Screen name="Add" component={() => <PlaceholderScreen title="Add" />} />
                <Tab.Screen name="Favorites" component={() => <PlaceholderScreen title="Favorites" />} />
                <Tab.Screen name="Profile" component={() => <PlaceholderScreen title="Profile" />} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
