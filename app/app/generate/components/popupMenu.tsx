import {
  Book,
  Edit,
  EllipsisVertical,
  Palette,
  Speech,
} from "lucide-react-native";
import { Platform, StyleSheet, Text } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export function PopupMenu({
  onPressEditButton,
  onPressMemoryButton,
  onPressTTSButton,
}: {
  onPressEditButton: () => void;
  onPressMemoryButton: () => void;
  onPressTTSButton: () => void;
}) {
  return (
    <Menu>
      <MenuTrigger style={styles.trigger}>
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
          <Text style={styles.optionText}>文章を編集</Text>
        </MenuOption>
        <MenuOption onSelect={onPressMemoryButton}>
          <Book size={18} color="#404040" />
          <Text style={styles.optionText}>設定を編集</Text>
        </MenuOption>
        <MenuOption onSelect={onPressTTSButton}>
          <Speech size={18} color="#404040" />
          <Text style={styles.optionText}>読み上げ</Text>
        </MenuOption>
        <MenuOption onSelect={() => {}}>
          <Palette size={18} color="#404040" />
          <Text style={styles.optionText}>テーマ</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 8,
  },
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
