import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { Search } from "lucide-react-native"

export default function SearchChip({ label, onPress, isSelected }: { label: string; onPress?: () => void; isSelected: boolean }) {
    return (
        <TouchableOpacity style={[styles.chip, isSelected && styles.selectedChip]} onPress={onPress} activeOpacity={0.7}>
            <Search size={16} color={isSelected ? "#fff" : "#666"} style={styles.icon} />
            <Text style={[styles.label, isSelected && {color: "white"}]}>{label}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        height: 40
    },
    selectedChip: {
        backgroundColor: "#266EF1",
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontSize: 14,
        color: "#333",
    },
})
