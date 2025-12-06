// File: src/navigation/MainStack.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Import your existing screens
import HomeScreen from '../screen/HomeScreen'; // Acting as Pokedex Tab
import DetailScreen from '../screen/DetailScreen'; // Likely used inside a stack, not a direct tab
import ProfileScreen from '../screen/ProfileScreen';

// Import new screens (Requirements 3-5)
import HuntScreen from '../screen/HuntScreen';
import CaptureScreen from '../screen/CaptureScreen';
import FeedScreen from '../screen/FeedScreen'; // <--- NOW USING THE REAL SCREEN

const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon Component
const TabIcon = ({ label, focused }) => {
  const iconMap = {
    Hunt: '🎯',
    Pokedex: '📚',
    AR: '📷', // Changed to Camera emoji to match Capture context
    Feed: '🌍', // Changed to Globe to match "Global Feed" context
    Profile: '👤',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text
        style={[styles.tabIcon, { color: focused ? '#fbbf24' : '#9ca3af' }]}
      >
        {iconMap[label] || '❓'}
      </Text>
      <Text
        style={[styles.tabLabel, { color: focused ? '#fbbf24' : '#9ca3af' }]}
      >
        {label}
      </Text>
    </View>
  );
};

// Main Stack with Bottom Tabs
export default function MainStack() {
  return (
    <Tab.Navigator
      initialRouteName="Hunt" // Sets Hunt as the default start screen
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // Hides default text to use our custom one
        animationEnabled: true,
      })}
    >
      {/* Tab 1: Hunt (Map/Geolocation) */}
      <Tab.Screen
        name="Hunt"
        component={HuntScreen}
        options={{ title: 'Hunt' }}
      />

      {/* Tab 2: Pokedex (List of Pokemon) */}
      {/* Note: We map HomeScreen here, as it contains your Pokedex list */}
      <Tab.Screen
        name="Pokedex"
        component={HomeScreen}
        options={{ title: 'Pokedex' }}
      />

      {/* Tab 3: AR (Camera/Capture) */}
      <Tab.Screen
        name="AR"
        component={CaptureScreen}
        options={{
          title: 'AR',
          // Optional: Hide tab bar when in Camera mode for full immersion
          // tabBarStyle: { display: 'none' }
        }}
      />

      {/* Tab 4: Feed (Community Social) */}
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />

      {/* Tab 5: Profile (User Stats & Gallery) */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111827', // Dark Grey/Navy
    borderTopColor: '#fbbf24', // Gold Accent
    borderTopWidth: 2,
    height: 70, // Taller bar for better touch targets
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});