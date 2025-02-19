import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
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
        name = "communityPage"
        options={
          {
            title: "Community",
            headerShown: false,
            tabBarIcon: ({color})=> (
              <FontAwesome name='circle' size={24} color={"#266EF1"}/>
            )
          }
        }
        />

    </Tabs>
  );
}
