import 'react-native-get-random-values';
import { firebaseConfig } from "@/Config/config";
import { AuthContext } from "@/Contexts/AuthContext";
import { DBContext } from "@/Contexts/dbContext";
import { FsContext } from "@/Contexts/FsContext";
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import PlacesProvider from './placesContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const FBapp = initializeApp(firebaseConfig);

  // initialize  firebase authentication
  const FBauth = getAuth(FBapp)

  //initialise the database firestore
  const FBdb = getFirestore(FBapp);


  // Get a reference to the storage service, which is used to create references in your storage bucket
  const storage = getStorage();

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  return (
<AuthContext.Provider value={FBauth}>
<DBContext.Provider value={FBdb}>
  <FsContext.Provider value={storage}>
    
  {/* useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  } */}
{/* 
  return ( */}
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* <Stack screenOptions={{headerShown: false}}> */}
      <PlacesProvider>

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        {/* <Stack.Screen name="rcommendationScreen" /> */}
        <Stack.Screen name="placeDetailsScreen"
        options={{
          headerShown: false
        }} />
      </Stack>
      </PlacesProvider>

      <StatusBar style="auto" />
    </ThemeProvider>
    </FsContext.Provider>
      </DBContext.Provider>
    </AuthContext.Provider>
   
          // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          //   <Stack>
          //     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          //     <Stack.Screen name="+not-found" />
          //   </Stack>
          //   <StatusBar style="auto" />
          // </ThemeProvider>
     

  );
}
