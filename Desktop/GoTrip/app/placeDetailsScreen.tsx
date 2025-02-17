import {View, Text, StyleSheet, Image} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PlaceDetailsScreen(props){
    const {item} = useLocalSearchParams();

    const placeData = JSON.parse(item);
    if (!placeData) {
        return <Text>No place data found</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{placeData.name}</Text>
            <Text>Location: {placeData.vicinity}</Text>
            <Text>Distance: {placeData.distance}</Text>
            <Text>Duration: {placeData.duration} away</Text>
            {placeData.photo && (
                <Image
                    source={{ uri: placeData.photo }}
                    style={styles.image}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    image: {
        height: 200,
        width: 200,
        marginTop: 16,
        borderRadius: 8,
    },
});