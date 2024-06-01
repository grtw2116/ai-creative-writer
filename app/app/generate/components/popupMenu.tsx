import { Book, Edit, EllipsisVertical, Speech } from "lucide-react-native";
import { Platform, StyleSheet, Text } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export function PopupMenu({
  onPressEditButton,
}: {
  onPressEditButton: () => void;
}) {
  return (
    <Menu>
      <MenuTrigger>
        <EllipsisVertical size={24} color="#404040" />
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: styles.options,
          optionWrapper: styles.optionWrapper,
        }}
      >
        <MenuOption onSelect={onPressEditButton}>
          <Edit size={18} color="#404040" />
          <Text style={styles.optionText}>編集</Text>
        </MenuOption>
        <MenuOption onSelect={() => {}}>
          <Book size={18} color="#404040" />
          <Text style={styles.optionText}>メモリ</Text>
        </MenuOption>
        <MenuOption onSelect={() => {}}>
          <Speech size={18} color="#404040" />
          <Text style={styles.optionText}>読み上げ</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

const styles = StyleSheet.create({
  options: {
    marginTop: 40,
    borderRadius: 5,
    backgroundColor: "#FAF9F6",
  },
  optionWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    gap: 16,
  },
  optionText: {
    marginVertical: 8,
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
  },
});
