import { Tabs } from 'expo-router';
import React from 'react';

import Foundation from '@expo/vector-icons/Foundation';
// import Lucide from '@expo/vector-icons/Lucide';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        headerShown: false,
        tabBarShowLabel: false,
        // tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Foundation name="home" size={28} color={color} />,

        }}
      />r


      <Tabs.Screen
        name="subsCards"
        options={{
          title: 'Subscription & Cards',
          tabBarIcon: ({ color }) => <FontAwesome6 name="dollar" size={24} color={color} />,
          // tabBarIcon: ({ color }) => <AntDesign name="dollar-circle" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <AntDesign name="plus-circle" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <Foundation name="graph-bar" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user-alt" size={28} color={color} />,
        }}
      />

    </Tabs>
  );
}
