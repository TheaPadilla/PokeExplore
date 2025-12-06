// File: src/navigation/MainStack.js
// REPLACE YOUR ENTIRE FILE WITH THIS - Adds 5 bottom tabs

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Import your existing screens
import HomeScreen from '../screen/HomeScreen';
import DetailScreen from '../screen/DetailScreen';
import ProfileScreen from '../screen/ProfileScreen';

// Import new screens (Requirements 3-5)
import HuntScreen from '../screen/HuntScreen';
import CaptureScreen from '../screen/CaptureScreen';

// Create a placeholder Feed screen (you can create this later)
const FeedScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#065f46',
    }}
  >
    <Text style={{ color: '#fbbf24', fontSize: 18, fontWeight: 'bold' }}>
      📱 Feed
    </Text>
    <Text style={{ color: '#9ca3af', marginTop: 10 }}>Coming soon...</Text>
  </View>
);

const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon Component
const TabIcon = ({ label, focused }) => {
  const iconMap = {
    Hunt: '🎯',
    Pokedex: '📚',
    AR: '🎨',
    Feed: '📱',
    Profile: '👤',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text
        style={[styles.tabIcon, { color: focused ? '#fbbf24' : '#9ca3af' }]}
      >
        {iconMap[label]}
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
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        animationEnabled: true,
      })}
    >
      {/* Tab 1: Hunt */}
      <Tab.Screen
        name="Hunt"
        component={HuntScreen}
        options={{
          title: 'Hunt',
        }}
      />

      {/* Tab 2: Pokedex (your existing HomeScreen) */}
      <Tab.Screen
        name="Pokedex"
        component={HomeScreen}
        options={{
          title: 'Pokedex',
        }}
      />

      {/* Tab 3: AR (CaptureScreen with AR features) */}
      <Tab.Screen
        name="AR"
        component={CaptureScreen}
        options={{
          title: 'AR',
        }}
      />

      {/* Tab 4: Feed (placeholder for now) */}
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Feed',
        }}
      />

      {/* Tab 5: Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111827',
    borderTopColor: '#fbbf24',
    borderTopWidth: 3,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarItem: {
    flex: 1,
  },
  tabBarLabel: {
    fontSize: 1, // Hide default label
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
