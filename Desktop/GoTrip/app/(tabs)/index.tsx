import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

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
    const radius = 40000;
    const placeType = weatherToPlaceType[weatherType] || weatherToPlaceType.Default;
    
    const PLACES_URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&keyword=${placeType}&key=${PLACES_API_KEY}`;

    // Test url for places
    
    // const PLACES_URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.9163,151.2412&radius=15000&keyword=beach&key=AIzaSyDOkh_o7VNClpnHjKb0aMR0tpGQZjZ9hLE`;

    try {
      const response = await fetch(PLACES_URL);
      const data = await response.json();
      
      if (data.status === 'OK') {
        const places = data.results.map((place) => {
          // Check if place has photos and get the first photo reference
          const photoReference = place.photos && place.photos[0] ? place.photos[0].photo_reference : null;
          const photoUrl = photoReference ? getPlacePhotoUrl(photoReference) : null;
          
          return {
            name: place.name,
            vicinity: place.vicinity,
            photo: photoUrl,
            lat: place.geometry.location.lat,
            lon: place.geometry.location.lng
          };
        });

        // Now calculate the distance for each place
        const distances = [];
        
        for (let place of places) {
          const distanceData = await getTravelDistance(
            `${lat},${lon}`,
            `${place.lat},${place.lon}`
          );

          distances.push({
            ...place,
            distance: distanceData ? distanceData.distance : null,
            duration: distanceData ? distanceData.duration : null,
          });
        }

        setFetchedPlaces(distances);
      } else {
        setError(`Places API error: ${data.status}`);
      }
    } catch (error) {
      setError('Failed to fetch places');
    }
  };

  const getPlacePhotoUrl = (photoReference) => {
    if (!photoReference) return null;
    
    // Construct the photo URL using the photo_reference
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${PLACES_API_KEY}`;
  };
  

  const getTravelDistance = async (origin, destination) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${PLACES_API_KEY}`
      );
  
      if (response.data && response.data.rows && response.data.rows[0] && response.data.rows[0].elements[0]) {
        const distance = response.data.rows[0].elements[0].distance?.text;
        const duration = response.data.rows[0].elements[0].duration?.text;
  
        if (distance && duration) {
          return { distance, duration };
        } else {
          setError('No valid distance or duration found');
          return null;
        }
      } else {
        setError('Error fetching distance data: Invalid response structure');
        return null;
      }
    } catch (err) {
      setError('Error fetching distance data');
      console.error('Error fetching distance:', err);
      return null;
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
    getUserLocation();
  }, []);

  const renderItem = ({item}) => (
    <View style={styles.fetchedPlaces}> 
    {item.photo? (
      <Image
      style={styles.image}
      source={{uri: item.photo }}/>
    ): (<Text>No image found</Text>
    )}
     
      <View style={styles.fetchedPlacesSubDiv}>
        <Text style={styles.spotName}>{item.name}</Text>
        <Text>{item.vicinity}</Text>
        <Text>{item.distance} away</Text>
        <Text>{item.duration} away</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.mainDiv}>
      {loading && <ActivityIndicator size="large" color="blue" />}
      {error && <Text style={{color: 'red'}}>{error}</Text>}

      <Text style={styles.title}>Perfect Hangouts For {weather} Weather</Text>

      <FlatList
        style={{width:"100%"}}
        // data={fetchedPlaces.slice(0, 10)}
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
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    height: 140,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fetchedPlacesSubDiv: {
    flex: 1,
    marginLeft: 8,
    alignItems: 'flex-start',
    gap: 3,
    justifyContent: 'center'
  
  },
  spotName: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: 16
  },
  image: {
    height: 90,
    width: 80,
    marginRight: 8,
    borderRadius: 7
  }
});
