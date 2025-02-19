// import { View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
// import { useRouter } from 'expo-router';

// // export default function RecommendedPlacesList({ places }) {
// //     const router = useRouter();

// //     const renderItem = ({ item }) => (
// //         <Pressable onPress={() => router.push({
// //             pathname: `/placeDetailsScreen`, 
// //             params: {
// //                 item: JSON.stringify(item)
// //             }})}>
// //             <View style={styles.fetchedPlaces}> 
// //                 {item.photo ? (
// //                     <Image style={styles.image} source={{ uri: item.photo }} />
// //                 ) : (
// //                     <Text>No image found</Text>
// //                 )}
// //                 <View style={styles.fetchedPlacesSubDiv}>
// //                     <Text style={styles.spotName}>{item.name}</Text>
// //                     <Text>{item.vicinity}</Text>
// //                     <Text>{item.distance}</Text>
// //                     <Text>{item.duration} away</Text>
// //                 </View>
// //             </View>
// //         </Pressable>
// //     );

// //     return (
// //         <FlatList
// //             style={{ width: "100%" }}
// //             data={places}
// //             renderItem={renderItem}
// //             keyExtractor={(item, index) => index.toString()}
// //         />
// //     );
// // }

// const styles = StyleSheet.create({
//     fetchedPlaces: {
//         backgroundColor: '#D9D9D9',
//         borderRadius: 10,
//         height: 140,
//         padding: 16,
//         margin: 16,
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     fetchedPlacesSubDiv: {
//         flex: 1,
//         marginLeft: 8,
//         alignItems: 'flex-start',
//         justifyContent: 'center',
//     },
//     spotName: {
//         fontWeight: 'bold',
//         textTransform: 'capitalize',
//         fontSize: 16,
//         marginBottom: 4, 
//     },
//     image: {
//         height: 90,
//         width: 80,
//         marginRight: 8,
//         borderRadius: 7,
//     },
// });
