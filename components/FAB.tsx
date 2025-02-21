import { Pressable, TouchableOpacity, StyleSheet, Animated, ViewStyle } from "react-native";
import { Plus } from "lucide-react-native";

export default function ({style, onPress}:{style?: ViewStyle | ViewStyle[], onPress?:() => void}) {
    const animation = new Animated.Value(1)
    return (
        <Pressable style = {style} onPress={onPress}>
            <Animated.View style={styles.container}>
                <TouchableOpacity onPress={onPress} style={[styles.button,
                 {
                    transform: [{ scale: animation }],
                },]}>
                    <Plus color="#FFF"/>
                </TouchableOpacity>
            </Animated.View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 64,
        width: 64,
        backgroundColor: "#266EF1",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    button: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
})