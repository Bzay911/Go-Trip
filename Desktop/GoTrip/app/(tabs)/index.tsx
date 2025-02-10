import { useState, useEffect,  } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedPlaces, setFetchedPlaces] = useState([]);

  const WEATHER_API_KEY = 'c763f6d7ec19c8fb9b01b9a7fe0ad4d0';
  const PLACES_API_KEY = 'AIzaSyDOkh_o7VNClpnHjKb0aMR0tpGQZjZ9hLE';

  // Function to get user location
  const getUserLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (err) {
      setError('Error getting location');
      console.log('Location Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch weather data
  const fetchWeather = async (lat, lon) => {
    const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

    try {
      const response = await fetch(WEATHER_URL);
      const data = await response.json();

      if (data.cod !== 200) {
        setError(`Weather API error: ${data.message}`);
        return;
      }

      if (data.weather?.length > 0) {
        setWeather(data.weather[0].main); 
      }
    } catch (err) {
      setError('Error fetching weather data');
      console.log('Weather API Error:', err);
    }
  };

  // Mapping weather to valid Google Place types
  const weatherToPlaceType = {
    Clear: "beach",
    Clouds: "park",
    Rain: "cafe",
    Snow: "tourist_attraction",
    Thunderstorm: "library",
    Default: "park",
  };

  const getPlacesByWeatherType = async (lat, lon, weatherType) => {
    const radius = 5000; // 5 km search radius
    const placeType = weatherToPlaceType[weatherType] || weatherToPlaceType.Default;
    
    const PLACES_URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${placeType}&key=${PLACES_API_KEY}`;

    try {
      const response = await fetch(PLACES_URL);
      const data = await response.json();
      
      if (data.status === 'OK') {
        setFetchedPlaces(data.results);
      } else {
        setError(`Places API error: ${data.status}`);
      }
    } catch (error) {
      setError('Failed to fetch places');
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    if (location && weather) {
      getPlacesByWeatherType(location.latitude, location.longitude, weather);
    }
  }, [weather]);

  useEffect(() => {
    getUserLocation()
  }, [])

  const renderItem = ({item}) =>(
    <View> 
        <Text  style = {styles.fetchedPlaces} >{item.name}</Text>
        <Text> {item.vicinity}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.mainDiv}>
  
      {loading && <ActivityIndicator size="large" color="blue" />}
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
  
      <Text style = {styles.title}>Enjoy your day in: {weatherToPlaceType[weather] || weatherToPlaceType.Default}</Text>

      <FlatList
        style={{width:"100%"}}
        data={fetchedPlaces}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  mainDiv: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
  },

  title: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign:'left',
    margin: 16
  },

  fetchedPlaces: {
    backgroundColor: 'gray',
    borderRadius: 5,
    height: 70,
    padding: 16,
    fontSize: 18,
    margin: 16
  }
});
