import { Stack } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function StoryModal() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "メモリ",
          presentation: "modal",
        }}
      />
      <View style={styles.optionContainer}>
        <Text style={styles.h2}>ストーリー設定</Text>
        <TextInput
          style={styles.textInput}
          placeholder="あいうえお"
          multiline
        />
        <Text style={styles.tips}>
          キャラクターの名前や設定、舞台設定など、ストーリー生成時に記憶させたい情報を入力してください。
          ここに入力された文章は、生成時にプロンプトの前に追加されます。
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    padding: 16,
  },
  h2: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tips: {
    marginTop: 8,
    color: "#999999",
    fontSize: 12,
  },
  textInput: {
    fontSize: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    height: 160,
  },
});
