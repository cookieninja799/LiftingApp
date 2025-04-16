//index.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RecordWorkout from './RecordWorkout';
import Logs from './Logs';
import Analytics from './Analytics';
import PRTab from './PRTab';
import Profile from './Profile'; // Import the new Profile tab
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            if (route.name === 'Record') iconName = 'create-outline';
            else if (route.name === 'Logs') iconName = 'document-text-outline';
            else if (route.name === 'Analytics') iconName = 'stats-chart-outline';
            else if (route.name === 'PR') iconName = 'trophy-outline';
            else if (route.name === 'Profile') iconName = 'person-circle-outline';
            else iconName = 'help-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6200EE',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Record" component={RecordWorkout} />
        <Tab.Screen name="Logs" component={Logs} />
        <Tab.Screen name="Analytics" component={Analytics} />
        <Tab.Screen name="PR" component={PRTab} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
