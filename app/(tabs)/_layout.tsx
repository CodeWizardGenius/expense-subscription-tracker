import { Tabs } from 'expo-router';
import React from 'react';

import Foundation from '@expo/vector-icons/Foundation';


export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        headerShown: false,
        // tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Foundation name="home" size={28} color={color} />,

        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Foundation name="dollar" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
