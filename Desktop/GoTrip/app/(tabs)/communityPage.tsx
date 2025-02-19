import { SafeAreaView, ScrollView, StyleSheet, View, FlatList } from "react-native"
import { useContext, useState, useEffect } from "react"
import { DBContext } from "@/Contexts/dbContext"
import Post from "@/components/Post"
import SearchChip from "@/components/SearchChip"
import FAB from "@/components/FAB"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import PlaceSearchBar from "@/components/PlaceSearchBar"
import { collection, onSnapshot, query, QuerySnapshot } from "firebase/firestore"

export default function communityPage() {
    const db = useContext(DBContext);
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (loaded == false) {
            fetchData();
            setLoaded(true);
        }
    }, [data]);

    const fetchData = async () => {
        const path = "posts"
        const q = query(collection(db, path))
        const unsub = onSnapshot(q, (querySnapshot) => {
            let items: any = [];
            querySnapshot.forEach((doc) => {
                let item = doc.data();
                item.id = doc.id;
                items.push(item);
            });
            setData(items);
        })
    }

    const handleNavigate = () => {
        // Navigates to the "another-screen" route (file name without extension)
        try {
            router.push("/uploadScreen");
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const ListItem = (props: any) => {
        const postData = {
            postId: props.id,
            username: "Steves John",
            images: [props.image],
            likes: props.numberOfLikes,
            comments: "5.3k",
            hashtags: ["nature", "sunset", "photography", "wollhara"],
            caption: "Hiking at Woolhara....",
            postedDate: props.createdAt,
        }

        return (
            <Post {...postData} />
        )
    }

    const renderItem = ({ item }: any) => {
        return (
            <ListItem
                id={item.id}
                image={item.imageURL}
                numberOfLikes ={item.numberOfLikes}
                createdAt={item.createdAt}
            />
        );
    };

    const Separator = () => {
        return <View style={styles.separator}></View>;
    };

    const searchChips = ["Lookout", "Sunrise", "Beach", "Sunset"]

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.searchBarContainer}>
                    <PlaceSearchBar />
                </View>
                <View style={styles.contentWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.searchChipContainer}
                    >
                        {searchChips.map((chip) => (
                            <SearchChip
                                key={chip}
                                label={chip}
                                isSelected={false}
                            />
                        ))}
                    </ScrollView>

                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item: any) => item.id}
                        ItemSeparatorComponent={Separator}
                    />
                </View>
            </View>
            <FAB style={[styles.fab, { bottom: 50 + insets.bottom }]} onPress={() => { handleNavigate() }} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    mainContainer: {  // Add this new style
        flex: 1,
        position: 'relative',
    },
    searchBarContainer: {
        paddingHorizontal: 10,
        paddingTop: 30,
        paddingBottom: 10,
        backgroundColor: "#fff",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    scrollView: {  // Add this new style
        flex: 1,
        marginTop: 75,  // Adjust this value based on your search bar height
    },
    contentContainer: {
        padding: 10,
        paddingTop: 20,
        paddingBottom: 100
    },
    searchChipContainer: {
        height: 40,
        marginVertical: 12
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 32,
        zIndex: 100
    },
    separator: {
        height: 10,
        backgroundColor: "#EAEAEA",
    },
    contentWrapper: {
        flex: 1,
        marginTop: 100, // Adjust based on your search bar height
    },
})