import 'react-native-get-random-values';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";
import { View } from "react-native";

export default function PlaceSearchBar() {

    const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

    return (
        <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
            <GooglePlacesAutocomplete
                placeholder="Search for places"
                fetchDetails={true}
                onPress={(data, details = null) => {
                    console.log("Place Data:", data);
                    console.log("Place Details:", details); // Contains lat, lng, and more
                }}
                query={{
                    key: apiKey,
                    language: "en"
                }}
                styles={{
                    textInput: {
                        height: 50,
                        fontSize: 18,
                        borderWidth: 1,         // 1px border
                        borderColor: "black",
                    },
                }}
            />
        </View>
    )
}