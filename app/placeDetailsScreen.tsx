import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Linking,
  FlatList,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const PLACES_API_KEY = "AIzaSyDOkh_o7VNClpnHjKb0aMR0tpGQZjZ9hLE";

export default function PlaceDetailsScreen() {
  const { item, location } = useLocalSearchParams();
  const placeData = JSON.parse(item);
  const locationData = location ? JSON.parse(location) : null;

  const router = useRouter();

  const bottomSheetRef = useRef<BottomSheet>(null);

  // States
  const [currentLocation, onChangeCurrentLocation] = useState("Your Location");
  const [destinationLocation, onChangeDestinationLocation] = useState(
    placeData.name
  );
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [availableStops, setAvailableStops] = useState([]); // Holds fetched stops for selection
  const [selectedCategory, setSelectedCategory] = useState(null); // Stores selected stop category
  const [stops, setStops] = useState([]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  useEffect(() => {
    if (locationData) {
      getRoute(locationData, placeData);
    }
  }, [locationData, placeData, routeCoordinates.length]);

  const stopsData = [
    { icon: "search", text: "Petrol", searchData: "gas_station" },
    { icon: "search", text: "Lookouts", searchData: "scenic_viewpoint" },
    { icon: "search", text: "Cafe", searchData: "cafe" },
    { icon: "search", text: "Restaurants", searchData: "restaurant" },
    { icon: "search", text: "Sunrise", searchData: "tourist_attraction" },
  ];

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

      if (data.status === "OK") {
        let detailedCoordinates = [];
        const legs = data.routes[0].legs;
        legs.forEach((leg) => {
          leg.steps.forEach((step) => {
            const stepPoints = polyline
              .decode(step.polyline.points)
              .map(([lat, lon]) => ({ latitude: lat, longitude: lon }));
            detailedCoordinates = detailedCoordinates.concat(stepPoints);
          });
        });
        setRouteCoordinates(detailedCoordinates);
      } else {
        console.log("Directions API error:", data.status, data.error_message);
      }
    } catch (error) {
      console.log("Error fetching route:", error);
    }
  };

  const openGoogleMaps = () => {
    if (!locationData || !placeData) return;

    const origin = `${locationData.latitude},${locationData.longitude}`;
    const destination = `${placeData.lat},${placeData.lon}`;
    const waypointStr = stops
      .map((stop) => `${stop.latitude},${stop.longitude}`)
      .join("|");

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&waypoints=${waypointStr}`;

    Linking.openURL(url);
  };

  const fetchStopsAlongRoute = async (stopType) => {
    if (!routeCoordinates.length) return;

    //Waypoints are the points that map uses as reference to search for the places
    const waypoints = routeCoordinates.filter((_, index) => index % 10 === 0); // Reduce API calls by limiting the waypoints
    const results = [];

    for (const point of waypoints) {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.latitude},${point.longitude}&radius=1500&type=${stopType}&key=${PLACES_API_KEY}`;

      try {
        const response = await fetch(placesUrl);
        const data = await response.json();

        if (data.status === "OK") {
          results.push(
            ...data.results.map((place) => ({
              id: place.place_id,
              name: place.name,
              vicinity: place.vicinity,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              openNow: place.opening_hours
                ? place.opening_hours.open_now
                : null,
            }))
          );
        }
      } catch (error) {
        console.log("Error fetching stops:", error);
      }
    }

    setAvailableStops(results);
    setSelectedCategory(stopType);
    setIsBottomSheetOpen(true); // Trigger BottomSheet to open
  };

  const getCategoryLabel = (categoryKey) => {
    const category = stopsData.find((item) => item.searchData === categoryKey);
    return category ? category.text : categoryKey; // Fallback to key if not found
  };

  // If places data not found
  if (!placeData) {
    return <Text>No place data found</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView>
        <View style={styles.container}>
          <Ionicons
            name={"chevron-back-outline"}
            size={30}
            onPress={() => router.back()}
          />

<View style={styles.inputContainer}>
  {stops.length === 0 ? (
    // If no stops, show input fields for start and destination
    <>
      <TextInput
        style={styles.input}
        onChangeText={onChangeCurrentLocation}
        value={currentLocation}
        placeholder="Enter start location"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangeDestinationLocation}
        value={destinationLocation}
        placeholder="Enter destination"
      />
    </>
  ) : (
    // If stops exist, display the formatted route
    <View style={styles.routeBox}>
      {/* Start Location */}
      <Text style={styles.locationText}>{currentLocation}</Text>

      {/* Display Stops */}
      {stops.length === 1 ? (
        <Text style={styles.locationText}>Stop: {stops[0].name}</Text>
      ) : stops.length > 1 ? (
        <>
           <Text style={styles.locationText}>{stops.length} stops</Text>
        </>
      ) : (
        <>
        
        
        </>
      )}
      <Text style={styles.locationText}>{destinationLocation}</Text>
    </View>
  )}
</View>


        </View>

        <Text style={styles.addStopTitleText}>Add stops along the route</Text>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buttonContainer}
          >
            {stopsData.map((item, index) => (
              <Pressable
                key={index}
                style={styles.addStopButton}
                onPress={() => {
                  console.log(item.text);
                  fetchStopsAlongRoute(item.searchData);
                  setIsBottomSheetVisible(true);
                }}
              >
                <Ionicons name={item.icon} size={20} />
                <Text>{item.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.mapContainer}>
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
              <Marker
                coordinate={{
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                }}
                title="Your Location"
              />
            )}
            {placeData?.lat && placeData?.lon && (
              <Marker
                coordinate={{
                  latitude: parseFloat(placeData.lat),
                  longitude: parseFloat(placeData.lon),
                }}
                title={placeData.name}
              />
            )}
            {stops.map((stop, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                title={stop.name}
                pinColor="gray"
              />
            ))}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={6}
                strokeColor="blue"
              />
            )}
            {stops.length > 0 && (
              <Polyline
                coordinates={[
                  {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                  },
                  ...stops.map((stop) => ({
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                  })),
                  {
                    latitude: parseFloat(placeData.lat),
                    longitude: parseFloat(placeData.lon),
                  },
                ]}
                strokeWidth={6}
                strokeColor="blue"
              />
            )}
          </MapView>
        </View>

        <View style={styles.bottomButtonsContainer}>
          <Pressable style={styles.bottomButton}>
            <Ionicons name="car" size={20} style={styles.bottomButtonIcon} />
            <Text style={styles.bottomButtonText}>
              {placeData.duration} ({placeData.distance})
            </Text>
          </Pressable>

          <Pressable style={styles.bottomButton} onPress={openGoogleMaps}>
            <Ionicons
              name="navigate"
              size={20}
              style={styles.bottomButtonIcon}
            />
            <Text style={styles.bottomButtonText}>Start</Text>
          </Pressable>
        </View>

        {isBottomSheetVisible && (
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={["25%", "50%", "100%"]} // Define height options
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
          >
            <BottomSheetView style={styles.contentContainer}>
              <Text style={styles.modalTitle}>
                Select a {getCategoryLabel(selectedCategory)}
              </Text>
              <FlatList
                data={availableStops.slice(0, 30)}
                keyExtractor={(item, index) => `${item.id}-${index}`} // Combining `id` with index
                renderItem={({ item }) => (
                  <View style={styles.stopContainer}>
                    <View style={styles.stopTexts}>
                      <Text style={styles.stopText}>{item.name}</Text>
                      <Text style={styles.stopSubText}>{item.vicinity}</Text>
                      {item.openNow !== null && (
                        <Text style={styles.stopStatus}>
                          {item.openNow ? "Open Now" : "Closed"}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => {
                        setStops([...stops, item]);
                        setIsBottomSheetVisible(false); // Close BottomSheet after selecting a stop
                      }}
                    >
                      <Ionicons name="add" size={20} />
                    </Pressable>
                  </View>
                )}
              />

              <Pressable
                onPress={() => setIsBottomSheetVisible(false)} // Close BottomSheet
                style={styles.closeModal}
              >
                <Text>Close</Text>
              </Pressable>
            </BottomSheetView>
          </BottomSheet>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  stopContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  stopTexts: {
    flexDirection: "column",
    gap: 3,
  },
  stopText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  stopSubText: {
    fontSize: 14,
    color: "gray",
  },
  stopStatus: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  closeModal: {
    marginTop: 20,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  container: {
    marginLeft: 16,
    marginRight: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    height: 50,
    margin: 8,
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize:16
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapContainer: {
    width: "100%",
    height: 550,
    marginTop: 8,
  },
  addStopTitleText: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 16,
    marginTop: 8,
  },
  addStopButton: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    margin: 8,
    alignSelf: "flex-start",
    padding: 12,
    borderRadius: 20,
    gap: 5,
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: "row",
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  bottomButton: {
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  bottomButtonIcon: {
    color: "white",
  },
  bottomButtonText: {
    color: "white",
  },
  // inputContainer: {
  //   padding: 16,
  // },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: 8,
  //   padding: 12,
  //   marginBottom: 10,
  // },
  routeBox: {
    borderWidth:1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 18,
    margin:8
  },
  locationText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
