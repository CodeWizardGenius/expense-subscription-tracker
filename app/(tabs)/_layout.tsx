import { Tabs } from 'expo-router';
import React from 'react';

// import Lucide from '@expo/vector-icons/Lucide';
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AnalyticsIcon from '@/src/components/svgIcons/AnalyticsIcon';
import DollarIcon from '@/src/components/svgIcons/DollarIcon';
import HomeIcon from '@/src/components/svgIcons/HomeIcon';
import PlusIcon from '@/src/components/svgIcons/PlusIcon';
import UserIcon from '@/src/components/svgIcons/UserIcon';


export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#06e0f9",
        headerShown: false,
        tabBarShowLabel: false,
        // tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
          // tabBarIcon: ({ color }) => <Foundation name="home" size={28} color={color} />,


        }}
      />


      <Tabs.Screen
        name="subsCards"
        options={{
          title: 'Subscription & Cards',
          tabBarIcon: ({ color }) => <DollarIcon size={28} color={color} />,
          // tabBarIcon: ({ color }) => <AntDesign name="dollar-circle" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <PlusIcon size={28} color={color} />,
          // tabBarIcon: ({ color }) => <AntDesign name="plus-circle" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <AnalyticsIcon size={28} color={color} />,
          // tabBarIcon: ({ color }) => <Foundation name="graph-bar" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon size={28} color={color} />,
          // tabBarIcon: ({ color }) => <FontAwesome5 name="user-alt" size={28} color={color} />,
        }}
      />

    </Tabs>
  );
}
