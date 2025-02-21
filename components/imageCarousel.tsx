import { useState } from "react"
import {
    View, StyleSheet, ScrollView,
    Image,
    Dimensions,
    type NativeSyntheticEvent,
    type NativeScrollEvent,
} from "react-native"

interface ImageCarouselProps {
    images: string[]
}
const { width } = Dimensions.get("window")

export default function ImageCarousel({ images }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
        const slideSize = event.nativeEvent.layoutMeasurement.width
        const offset = event.nativeEvent.contentOffset.x
        const activeIndex = Math.round(offset / slideSize)
        setActiveIndex(activeIndex)
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}>

                {images.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.image} resizeMode="cover" />
                ))}
            </ScrollView>

            {images.length > 1 && (
                <View style={styles.pagination}>
                    {images.map((_, index) => (
                        <View key={index} style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]}>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    image: {
        width: width - 32, // Accounting for container padding
        height: 300,
        borderRadius: 8,
    },
    pagination: {
        flexDirection: "row",
        position: "absolute",
        bottom: 8,
        alignSelf: "center",
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        marginHorizontal: 3,
    },
    paginationDotActive: {
        backgroundColor: "#fff",
    }
})