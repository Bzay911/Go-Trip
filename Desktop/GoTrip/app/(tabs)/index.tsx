import { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get user location
  const getUserLocation = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      await fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setError('Error getting location');
      console.log('Location Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch weather data
  const fetchWeather = async (lat, lon) => {
    const API_KEY = 'c763f6d7ec19c8fb9b01b9a7fe0ad4d0'; // Replace with your API key
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=-33.863815&lon=151.081945&appid=${API_KEY}`;

    try {
      const response = await fetch(URL);
      const data = await response.json();

      console.log(data)

      if (data.cod !== 200) {
        setError(`Weather API error: ${data.message}`);
        return;
      }

      setWeather(data);
    } catch (err) {
      setError('Error fetching weather data');
      console.log('Weather API Error:', err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Get Location & Weather" onPress={getUserLocation} />

      {loading && <ActivityIndicator size="large" color="blue" />}
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {location && (
        <Text>
          🌍 Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      )}

      {weather && weather.weather && weather.weather.length > 0 && (
        <Text>
          🌤 Weather: {weather.weather[0].description}, 🌡 {weather.main.temp}°C
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainDiv: {
    flex:1,
    flexDirection: 'column'
  }
})
