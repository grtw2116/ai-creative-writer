import {
  Text,
  GestureResponderEvent,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export function GenreOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: (event: GestureResponderEvent) => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={selected ? styles.genreItemActive : styles.genreItem}
    >
      <Text style={{ color: selected ? "#FFFFFF" : "#333333" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  genreItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: "#C0C0C0",
  },
  genreItemActive: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: "#404040",
  },
});
