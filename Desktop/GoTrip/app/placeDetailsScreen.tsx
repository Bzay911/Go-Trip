import {View, Text, StyleSheet, TextInput, Pressable, ScrollView, Linking} from 'react-native';
import { useLocalSearchParams, useRouter} from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {Marker, Polyline} from 'react-native-maps';
import polyline from '@mapbox/polyline';


const PLACES_API_KEY = "AIzaSyDOkh_o7VNClpnHjKb0aMR0tpGQZjZ9hLE"

export default function PlaceDetailsScreen(){
    const {item, location} = useLocalSearchParams();
    const placeData = JSON.parse(item);
    const locationData = location ? JSON.parse(location) : null;

    const router = useRouter();

    // States
    const [currentLocation, onChangeCurrentLocation] = useState('Your Location')
    const [destinationLocation, onChangeDestinationLocation] = useState(placeData.name)
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    useEffect(() => {
        if(locationData){
            getRoute(locationData, placeData);
        }
    }, [locationData, placeData, routeCoordinates.length])

    const stopsData = [
        {icon: 'search', text: 'Petrol'},
        {icon: 'search', text: 'Lookouts'},
        {icon: 'search', text: 'Cafe'},
        {icon: 'search', text: 'Restaurants'},
        {icon: 'search', text: 'Sunrise'},
    ]
    
    const getRoute = async (origin, destination) => {
        if (!origin || !destination) {
            console.log("Error: Origin or destination is missing!");
            return;
        }
    
        const originLat = parseFloat(origin.latitude);
        const originLon = parseFloat(origin.longitude);
        const destinationLat = parseFloat(destination.lat); 
        const destinationLon = parseFloat(destination.lon); 
    
    
        const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLon}&destination=${destinationLat},${destinationLon}&mode=driving&key=${PLACES_API_KEY}`;
        
        try {
            const response = await fetch(routeUrl);
            const data = await response.json();
            
    
            if (data.status === 'OK') {
                const encodedPoints = data.routes[0].overview_polyline.points;
                const decodedPoints = polyline.decode(encodedPoints).map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
    
                setRouteCoordinates(decodedPoints);
            } else {
                console.log("Directions API error:", data.status, data.error_message);
            }
        } catch (error) {
            console.log('Error fetching route:', error);
        }
    };

    const openGoogleMaps = () => {
        if(!locationData || !placeData) return;

        const origin = `${locationData.latitude}, ${locationData.longitude}`;
        const destination = `${placeData.lat}, ${placeData.lon}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

        Linking.openURL(url);
    }
    

    // If places data not found
    if (!placeData) {
        return <Text>No place data found</Text>;
    }

    return (
        <SafeAreaView style = {styles.safeArea}>
        <View style={styles.container}>
            <Ionicons
            name={'chevron-back-outline'} 
            size={30}
            onPress={() => router.back()} />

            <View style = {styles.inputContainer}>
            <TextInput
                style = {styles.input}
                onChangeText={onChangeCurrentLocation}
                value= {currentLocation} 
                />

            <TextInput
                style = {styles.input}
                onChangeText={onChangeDestinationLocation}
                value= {destinationLocation} 
                />
            </View>
           </View>

           <Text style = {styles.addStopTitleText}>Add stops along the route</Text>

           <View>
           <ScrollView 
           horizontal
           showsHorizontalScrollIndicator = {false}
           contentContainerStyle = {styles.buttonContainer}>
           {stopsData.map((item, index) => (
            <Pressable key={index} style = {styles.addStopButton}>
                <Ionicons name={item.icon} size={20} />
                <Text>{item.text}</Text>
            </Pressable>
           ))}
           </ScrollView>
           </View>
         

           <View style = {styles.mapContainer}>
           <MapView
                style={styles.map}
                initialRegion={{
                    latitude: locationData?.latitude || 37.7749,
                    longitude: locationData?.longitude || -122.4194,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {locationData && (
                    <Marker coordinate={{ latitude: locationData.latitude, longitude: locationData.longitude }} title="Your Location" />
                )}
                {placeData?.lat && placeData?.lon && (
                 <Marker coordinate={{ latitude: parseFloat(placeData.lat), longitude: parseFloat(placeData.lon) }} title={placeData.name} />
                    )}
                {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeWidth={6} strokeColor="blue" />}
            </MapView>
           </View>

           <View style = {styles.bottomButtonsContainer}>
            <Pressable style = {styles.bottomButton}>
            <Ionicons 
            name='car'
            size={20}
            style = {styles.bottomButtonIcon} 
            />
                <Text style = {styles.bottomButtonText}>{placeData.duration} ({placeData.distance})</Text>
            </Pressable>

            <Pressable style = {styles.bottomButton} onPress={openGoogleMaps}>
            <Ionicons 
            name='navigate'
            size={20}
            style = {styles.bottomButtonIcon} 
            />
             <Text style = {styles.bottomButtonText}>Start</Text>
            </Pressable>

           </View>
      
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex:1
    },
    container: {
        marginLeft: 16,
        marginRight: 16,
        flexDirection: 'row',
        // alignItems: 'flex-start',
    },
    inputContainer: {
        flex: 1,
    },
    input: {
        height: 50,
        margin: 8,
        borderWidth: 1,
        padding: 10,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapContainer: {
        width: '100%',
        height: 550,
        marginTop: 8
    },
    addStopTitleText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 16,
        marginTop: 8,
    },
    addStopButton: {
        flexDirection: 'row',
        backgroundColor: '#D9D9D9',
        margin: 8,
        alignSelf: 'flex-start',
        padding: 12,
        borderRadius: 20,
        gap: 5,
        
    },
    buttonContainer: {
        marginTop: 8,
        flexDirection: 'row',
    },
    bottomButtonsContainer: {
        flexDirection : 'row',
        justifyContent: 'space-around',
        marginTop: 12
    },
    bottomButton: {
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        borderRadius: 25,
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
    },
    bottomButtonIcon: {
        color: 'white'
    },
    bottomButtonText: {
        color: 'white'
    }
});