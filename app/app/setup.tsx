import { Entry } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function SetupPage() {
  const key = new Date().toISOString();
  const [entry, setEntry] = useState<Entry>({
    uniqueKey: key,
    title: "",
    text: "",
    context: "",
  });

  const saveData = async (entry: Entry) => {
    try {
      const key = entry.uniqueKey;
      const value = JSON.stringify(entry);
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("データの保存中にエラーが発生しました", e);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "新規作成",
          headerRight: () => (
            <TouchableOpacity
              onPress={async () => {
                // TODO: validation
                await saveData(entry);
                router.replace({ pathname: "generate", params: entry });
              }}
            >
              <Check size={24} color="#404040" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.optionContainer}>
        <Text style={styles.h2}>物語設定</Text>
        <Text style={styles.h3}>タイトル</Text>
        <TextInput
          style={styles.titleInput}
          onChangeText={(text) => setEntry({ ...entry, title: text })}
          placeholder="吾輩は猫である"
        />
        <Text style={styles.h3}>あらすじ</Text>
        <TextInput
          style={styles.textArea}
          onChangeText={(text) => setEntry({ ...entry, text: text })}
          placeholder="ある日、生まれたばかりの猫が捨てられ、苦沙弥先生の家に住みつきます。苦沙弥先生は中学校の英語教師で、厳格で少し気難しい性格です。猫は新しい家に住みつき、人間たちの生活を観察し始めます。苦沙弥先生の家には、妻と娘たちが住んでおり、猫は彼らの日常を眺めるのが好きです。特に、苦沙弥先生の友人である寒月と迷亭が訪れるときの会話に興味を持ちます。"
          multiline
        />
        <Text style={styles.h3}>重要な物語設定</Text>
        <TextInput
          style={styles.textArea}
          onChangeText={(text) => setEntry({ ...entry, context: text })}
          placeholder="吾輩（猫）: 主人公であり、語り手の猫。苦沙弥先生の家に住みつき、人間たちの生活を観察する。
苦沙弥先生: 中学校の英語教師で、猫の飼い主。厳格で少し気難しい性格。
寒月: 苦沙弥先生の友人。真面目で誠実な人物。
迷亭: 苦沙弥先生の友人。皮肉屋で冗談が好き。"
          multiline
        />
        <Text style={styles.tips}>
          キャラクターの名前や設定、舞台設定など、ストーリー生成時に記憶させたい情報を入力してください。
          ここに入力された文章は、生成時にプロンプトの先頭に追加されます。
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    paddingHorizontal: 16,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
  },
  tips: {
    marginTop: 8,
    color: "#999999",
    fontSize: 12,
  },
  titleInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#737373",
    borderRadius: 4,
  },
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#737373",
    borderRadius: 4,
    height: 160,
    lineHeight: 20,
  },
});
