import { LucideIcon } from "lucide-react-native";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

export function IconButton({
  icon: Icon,
  onPress,
  disabled = false,
  isLoading = false,
  size = 24,
  color = "#404040",
  colorDisabled = "#B0B0B0",
  style,
}: {
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: number;
  color?: string;
  colorDisabled?: string;
  style?: any;
}) {
  const buttonColor = disabled ? colorDisabled : color;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.buttonContainer && style}
      disabled={disabled}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={buttonColor} />
      ) : (
        <Icon size={size} color={buttonColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 8,
  },
});
