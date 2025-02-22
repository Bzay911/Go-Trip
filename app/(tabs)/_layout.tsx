import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Ionicons } from '@expo/vector-icons';

import TabBarBackground from '@/components/ui/TabBarBackground';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>

         <Tabs.Screen
        name="dynamicPlanner"
        options={{
          title: 'Dynamic Planner',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />

         <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name='search' size={28} color={color}/>
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
     
      {/* <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Ionicons name='people' size={28} color={color}/>
        }}
      /> */}
   
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name='person-circle' size={28} color={color}/>
        }}
      />

        <Tabs.Screen
        name = "communityPage"
        options={
          {
            title: "Community",
            headerShown: false,
            tabBarIcon: ({color})=> (
             <Ionicons name='people' size={28} color={color}/>
            )
          }
        }
        />

    </Tabs>
  );
}
